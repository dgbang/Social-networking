const { Op } = require("sequelize");
const { sequelize, Conversation, ConversationMember, Message, User, Friendship } = require("../models");
const toPublicUser = require("../utils/publicUser");

const MESSAGE_LIMIT_MAX = 50;
const CONVERSATION_LIMIT_MAX = 50;
const MESSAGE_CONTENT_MAX = 5000;
const CALL_CONTENT_BY_STATUS = {
  ended: "Cuộc gọi đã kết thúc",
  rejected: "Cuộc gọi bị từ chối",
  missed: "Cuộc gọi nhỡ",
  canceled: "Cuộc gọi đã bị hủy",
  disconnected: "Cuộc gọi bị mất kết nối"
};

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeLimit(limit, fallback, max) {
  const value = Number(limit) || fallback;
  return Math.min(Math.max(value, 1), max);
}

function normalizeContent(content) {
  if (content === undefined || content === null) return "";
  return String(content).trim();
}

function serializeMessageContent(message) {
  if (!message || message.isDeleted) return null;
  if (message.type === "call") {
    return CALL_CONTENT_BY_STATUS[message.media?.status] || "Cuộc gọi";
  }
  return message.content;
}

function markCreateResult(conversation, created) {
  Object.defineProperty(conversation, "__created", {
    value: created,
    enumerable: false
  });
  return conversation;
}

function userInclude() {
  return {
    model: User,
    as: "user",
    attributes: ["id", "username", "fullName", "avatar", "coverPhoto", "bio", "isVerified", "createdAt"]
  };
}

function senderInclude() {
  return {
    model: User,
    as: "sender",
    attributes: ["id", "username", "fullName", "avatar", "coverPhoto", "bio", "isVerified", "createdAt"]
  };
}

function memberInclude() {
  return {
    model: ConversationMember,
    as: "members",
    where: { deletedAt: null },
    required: false,
    include: [userInclude()]
  };
}

function messageIncludes() {
  return [
    senderInclude(),
    {
      model: Message,
      as: "replyTo",
      include: [senderInclude()]
    }
  ];
}

async function areFriends(userA, userB) {
  if (!userA || !userB || userA === userB) return true;
  const friendship = await Friendship.findOne({
    where: {
      status: "accepted",
      [Op.or]: [
        { requesterId: userA, addresseeId: userB },
        { requesterId: userB, addresseeId: userA }
      ]
    }
  });
  return Boolean(friendship);
}

async function ensureFriends(currentUserId, memberIds) {
  for (const memberId of memberIds) {
    if (!(await areFriends(currentUserId, memberId))) {
      throw createError(403, "CHAT_FRIEND_REQUIRED", "Các thành viên trò chuyện phải là bạn bè đã chấp nhận kết bạn");
    }
  }
}

async function ensureMember(conversationId, userId, options = {}) {
  const member = await ConversationMember.findOne({
    where: { conversationId, userId, deletedAt: null },
    transaction: options.transaction
  });
  if (!member) {
    throw createError(403, "CONVERSATION_FORBIDDEN", "Bạn không phải là thành viên của cuộc trò chuyện này");
  }
  return member;
}

async function getConversationMemberIds(conversationId) {
  const rows = await ConversationMember.findAll({
    where: { conversationId, deletedAt: null },
    attributes: ["userId"]
  });
  return rows.map((row) => row.userId);
}

function serializeMember(member) {
  return {
    id: member.id,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt,
    lastReadAt: member.lastReadAt,
    user: toPublicUser(member.user, { includeEmail: false })
  };
}

function serializeMessage(message) {
  if (!message) return null;
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    content: serializeMessageContent(message),
    media: message.isDeleted ? null : message.media,
    type: message.type,
    isDeleted: message.isDeleted,
    deletedAt: message.deletedAt,
    sender: toPublicUser(message.sender, { includeEmail: false }),
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          senderId: message.replyTo.senderId,
          content: serializeMessageContent(message.replyTo),
          isDeleted: message.replyTo.isDeleted,
          sender: toPublicUser(message.replyTo.sender, { includeEmail: false })
        }
      : null,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };
}

async function getLastMessage(conversationId) {
  const message = await Message.findOne({
    where: { conversationId },
    include: messageIncludes(),
    order: [["createdAt", "DESC"]]
  });
  return serializeMessage(message);
}

async function getUnreadCount(conversationId, member, userId) {
  const where = {
    conversationId,
    senderId: { [Op.ne]: userId }
  };
  if (member.lastReadAt) {
    where.createdAt = { [Op.gt]: member.lastReadAt };
  }
  return Message.count({ where });
}

async function getUnreadSummary(userId) {
  const members = await ConversationMember.findAll({
    where: { userId, deletedAt: null },
    attributes: ["conversationId", "lastReadAt"]
  });

  const counts = await Promise.all(
    members.map(async (member) => ({
      conversationId: member.conversationId,
      unreadCount: await getUnreadCount(member.conversationId, member, userId)
    }))
  );

  return {
    unreadCount: counts.reduce((total, item) => total + item.unreadCount, 0),
    unreadConversations: counts.filter((item) => item.unreadCount > 0).length
  };
}

async function serializeConversation(conversation, userId) {
  const members = (conversation.members || []).map(serializeMember);
  const currentMember = (conversation.members || []).find((member) => member.userId === userId);
  const privateOther = conversation.type === "private" ? members.find((member) => member.userId !== userId)?.user : null;
  const lastMessage = await getLastMessage(conversation.id);

  return {
    id: conversation.id,
    type: conversation.type,
    name: conversation.type === "private" ? privateOther?.fullName || privateOther?.username || "Cuộc trò chuyện riêng tư" : conversation.name,
    avatar: conversation.type === "private" ? privateOther?.avatar || null : conversation.avatar,
    adminId: conversation.adminId,
    members,
    lastMessage,
    unreadCount: currentMember ? await getUnreadCount(conversation.id, currentMember, userId) : 0,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}

async function findPrivateConversation(userA, userB) {
  const candidates = await Conversation.findAll({
    where: { type: "private" },
    include: [memberInclude()]
  });

  return candidates.find((conversation) => {
    const ids = (conversation.members || []).map((member) => member.userId).sort();
    return ids.length === 2 && ids[0] === [userA, userB].sort()[0] && ids[1] === [userA, userB].sort()[1];
  });
}

async function listConversations(userId, { limit } = {}) {
  const normalizedLimit = normalizeLimit(limit, 20, CONVERSATION_LIMIT_MAX);
  const memberships = await ConversationMember.findAll({
    where: { userId, deletedAt: null },
    attributes: ["conversationId"]
  });
  const conversationIds = memberships.map((membership) => membership.conversationId);
  if (!conversationIds.length) {
    return [];
  }

  const conversations = await Conversation.findAll({
    where: { id: { [Op.in]: conversationIds } },
    include: [memberInclude()],
    order: [
      [sequelize.literal('"lastMessageAt" DESC NULLS LAST')],
      ["createdAt", "DESC"]
    ],
    limit: normalizedLimit
  });

  return Promise.all(conversations.map((conversation) => serializeConversation(conversation, userId)));
}

async function createConversation(userId, payload) {
  const type = payload.type;
  const memberIds = Array.from(new Set(payload.memberIds || [])).filter((id) => id !== userId);

  if (!["private", "group"].includes(type)) {
    throw createError(400, "INVALID_CONVERSATION_TYPE", "Loại cuộc trò chuyện không hợp lệ");
  }

  if (type === "private") {
    if (memberIds.length !== 1) {
      throw createError(400, "PRIVATE_CONVERSATION_TARGET_REQUIRED", "Cuộc trò chuyện riêng tư cần một người nhận");
    }
    await ensureFriends(userId, memberIds);
    const existing = await findPrivateConversation(userId, memberIds[0]);
    if (existing) {
      return markCreateResult(await serializeConversation(existing, userId), false);
    }
  }

  if (type === "group") {
    if (memberIds.length < 2) {
      throw createError(400, "GROUP_MEMBERS_REQUIRED", "Cuộc trò chuyện nhóm cần ít nhất hai thành viên khác");
    }
    if (!normalizeContent(payload.name)) {
      throw createError(400, "GROUP_NAME_REQUIRED", "Tên nhóm là bắt buộc");
    }
    await ensureFriends(userId, memberIds);
  }

  const conversation = await sequelize.transaction(async (transaction) => {
    const row = await Conversation.create(
      {
        type,
        name: type === "group" ? normalizeContent(payload.name) : null,
        adminId: type === "group" ? userId : null,
        lastMessageAt: new Date()
      },
      { transaction }
    );
    const rows = [userId, ...memberIds].map((memberId) => ({
      conversationId: row.id,
      userId: memberId,
      role: type === "group" && memberId === userId ? "admin" : "member",
      joinedAt: new Date()
    }));
    await ConversationMember.bulkCreate(rows, { transaction });
    return row;
  });

  const withMembers = await Conversation.findByPk(conversation.id, { include: [memberInclude()] });
  return markCreateResult(await serializeConversation(withMembers, userId), true);
}

async function listMessages(userId, conversationId, { cursor, limit } = {}) {
  await ensureMember(conversationId, userId);
  if (cursor && Number.isNaN(new Date(cursor).getTime())) {
    throw createError(400, "INVALID_CURSOR", "Con trỏ không hợp lệ");
  }
  const normalizedLimit = normalizeLimit(limit, 30, MESSAGE_LIMIT_MAX);
  const rows = await Message.findAll({
    where: {
      conversationId,
      ...(cursor ? { createdAt: { [Op.lt]: new Date(cursor) } } : {})
    },
    include: messageIncludes(),
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"]
    ],
    limit: normalizedLimit + 1
  });
  const page = rows.slice(0, normalizedLimit);
  const hasMore = rows.length > normalizedLimit;
  return {
    messages: page.reverse().map(serializeMessage),
    nextCursor: hasMore ? page[page.length - 1]?.createdAt?.toISOString() : null,
    hasMore
  };
}

async function createMessage(userId, payload) {
  const conversationId = payload.conversationId;
  const content = normalizeContent(payload.content);
  const replyToId = payload.replyToId || null;
  if (!conversationId) {
    throw createError(400, "CONVERSATION_REQUIRED", "Cuộc trò chuyện là bắt buộc");
  }
  if (!content) {
    throw createError(400, "MESSAGE_CONTENT_REQUIRED", "Nội dung tin nhắn là bắt buộc");
  }
  if (content.length > MESSAGE_CONTENT_MAX) {
    throw createError(400, "MESSAGE_CONTENT_TOO_LONG", "Nội dung tin nhắn quá dài");
  }

  await ensureMember(conversationId, userId);

  if (replyToId) {
    const replyTo = await Message.findOne({ where: { id: replyToId, conversationId } });
    if (!replyTo) {
      throw createError(404, "REPLY_MESSAGE_NOT_FOUND", "Không tìm thấy tin nhắn được trả lời");
    }
  }

  const message = await sequelize.transaction(async (transaction) => {
    const row = await Message.create(
      {
        conversationId,
        senderId: userId,
        replyToId,
        content,
        media: null,
        type: "text"
      },
      { transaction }
    );
    await Conversation.update({ lastMessageAt: new Date() }, { where: { id: conversationId }, transaction });
    await ConversationMember.update(
      { lastReadAt: new Date() },
      { where: { conversationId, userId }, transaction }
    );
    return row;
  });

  const withIncludes = await Message.findByPk(message.id, { include: messageIncludes() });
  return serializeMessage(withIncludes);
}

async function deleteMessage(userId, messageId) {
  const message = await Message.findByPk(messageId, { include: messageIncludes() });
  if (!message) {
    throw createError(404, "MESSAGE_NOT_FOUND", "Không tìm thấy tin nhắn");
  }
  await ensureMember(message.conversationId, userId);
  if (message.senderId !== userId) {
    throw createError(403, "MESSAGE_DELETE_FORBIDDEN", "Bạn không thể xóa tin nhắn này");
  }
  await message.update({
    content: null,
    media: null,
    isDeleted: true,
    deletedAt: new Date()
  });
  return serializeMessage(message);
}

async function markRead(userId, conversationId) {
  const member = await ensureMember(conversationId, userId);
  await member.update({ lastReadAt: new Date() });
  return {
    conversationId,
    userId,
    lastReadAt: member.lastReadAt
  };
}

module.exports = {
  ensureMember,
  getConversationMemberIds,
  getUnreadSummary,
  listConversations,
  createConversation,
  listMessages,
  createMessage,
  deleteMessage,
  markRead
};
