const { Op } = require("sequelize");
const { Friendship, User } = require("../models");
const chatService = require("./chat.service");
const notificationService = require("./notification.service");
const toPublicUser = require("../utils/publicUser");

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function ensureUserExists(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw createError(404, "USER_NOT_FOUND", "Không tìm thấy người dùng");
  }
  return user;
}

function pairWhere(userA, userB) {
  return {
    [Op.or]: [
      { requesterId: userA, addresseeId: userB },
      { requesterId: userB, addresseeId: userA }
    ]
  };
}

async function findPair(userA, userB) {
  return Friendship.findOne({ where: pairWhere(userA, userB) });
}

function serializeRelationship(friendship, currentUserId) {
  if (!friendship || friendship.status === "rejected") {
    return { status: "none", direction: null };
  }

  return {
    id: friendship.id,
    status: friendship.status,
    direction:
      friendship.status === "pending"
        ? friendship.requesterId === currentUserId
          ? "outgoing"
          : "incoming"
        : null
  };
}

function notifyFriendEvent(payload) {
  notificationService.createNotification(payload).catch(() => {});
}

async function getRelationship(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    return { status: "self", direction: null };
  }

  await ensureUserExists(targetUserId);
  const friendship = await findPair(currentUserId, targetUserId);
  return serializeRelationship(friendship, currentUserId);
}

async function sendRequest(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    throw createError(400, "FRIEND_REQUEST_SELF", "Bạn không thể gửi lời mời kết bạn cho chính mình");
  }

  await ensureUserExists(targetUserId);
  const existing = await findPair(currentUserId, targetUserId);

  if (existing?.status === "rejected") {
    await existing.update({
      requesterId: currentUserId,
      addresseeId: targetUserId,
      status: "pending"
    });
    notifyFriendEvent({
      userId: targetUserId,
      fromUserId: currentUserId,
      type: "friend_request",
      referenceId: currentUserId,
      content: "đã gửi cho bạn lời mời kết bạn"
    });
    return existing;
  }

  if (existing?.status === "accepted") {
    throw createError(409, "ALREADY_FRIENDS", "Hai người đã là bạn bè");
  }

  if (existing) {
    throw createError(409, "FRIEND_REQUEST_EXISTS", "Lời mời kết bạn đã tồn tại");
  }

  const friendship = await Friendship.create({
    requesterId: currentUserId,
    addresseeId: targetUserId,
    status: "pending"
  });
  notifyFriendEvent({
    userId: targetUserId,
    fromUserId: currentUserId,
    type: "friend_request",
    referenceId: currentUserId,
    content: "đã gửi cho bạn lời mời kết bạn"
  });
  return friendship;
}

async function acceptRequest(currentUserId, requesterId) {
  const friendship = await Friendship.findOne({
    where: {
      requesterId,
      addresseeId: currentUserId,
      status: "pending"
    }
  });

  if (!friendship) {
    throw createError(404, "FRIEND_REQUEST_NOT_FOUND", "Không tìm thấy lời mời kết bạn");
  }

  await friendship.update({ status: "accepted" });
  const conversation = await chatService.createConversation(currentUserId, {
    type: "private",
    memberIds: [requesterId]
  });
  notifyFriendEvent({
    userId: requesterId,
    fromUserId: currentUserId,
    type: "friend_accept",
    referenceId: currentUserId,
    content: "đã chấp nhận lời mời kết bạn của bạn"
  });
  return { friendship, conversation };
}

async function rejectRequest(currentUserId, requesterId) {
  const friendship = await Friendship.findOne({
    where: {
      requesterId,
      addresseeId: currentUserId,
      status: "pending"
    }
  });

  if (!friendship) {
    throw createError(404, "FRIEND_REQUEST_NOT_FOUND", "Không tìm thấy lời mời kết bạn");
  }

  await friendship.update({ status: "rejected" });
  return friendship;
}

async function unfriend(currentUserId, userId) {
  const friendship = await Friendship.findOne({
    where: {
      ...pairWhere(currentUserId, userId),
      status: "accepted"
    }
  });

  if (!friendship) {
    throw createError(404, "FRIENDSHIP_NOT_FOUND", "Không tìm thấy quan hệ bạn bè");
  }

  await friendship.destroy();
}

async function listFriends(currentUserId, limit = 20) {
  const rows = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      status: "accepted"
    }
  });

  const friendIds = rows.map((row) => (row.requesterId === currentUserId ? row.addresseeId : row.requesterId));
  const users = await User.findAll({
    where: { id: { [Op.in]: friendIds } },
    limit: Math.min(Number(limit) || 20, 50),
    order: [["fullName", "ASC"]]
  });
  return users.map((user) => toPublicUser(user, { includeEmail: false }));
}

async function listRequests(currentUserId, limit = 20) {
  const requests = await Friendship.findAll({
    where: {
      addresseeId: currentUserId,
      status: "pending"
    },
    include: [{ model: User, as: "requester" }],
    limit: Math.min(Number(limit) || 20, 50),
    order: [["createdAt", "DESC"]]
  });

  return requests.map((request) => ({
    id: request.id,
    status: request.status,
    requester: toPublicUser(request.requester, { includeEmail: false })
  }));
}

async function listSuggestions(currentUserId, limit = 20) {
  const relationships = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      status: { [Op.in]: ["pending", "accepted", "blocked"] }
    }
  });
  const excludedIds = new Set([currentUserId]);
  relationships.forEach((row) => {
    excludedIds.add(row.requesterId);
    excludedIds.add(row.addresseeId);
  });

  const users = await User.findAll({
    where: {
      id: { [Op.notIn]: [...excludedIds] }
    },
    limit: Math.min(Number(limit) || 20, 50),
    order: [["createdAt", "DESC"]]
  });

  return users.map((user) => toPublicUser(user, { includeEmail: false }));
}

module.exports = {
  getRelationship,
  sendRequest,
  acceptRequest,
  rejectRequest,
  unfriend,
  listFriends,
  listRequests,
  listSuggestions
};
