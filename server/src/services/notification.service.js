const { Op } = require("sequelize");
const { Notification, User } = require("../models");
const toPublicUser = require("../utils/publicUser");

const TYPES = ["like", "comment", "friend_request", "friend_accept", "share", "message"];
const STATUSES = ["all", "unread", "read"];
const MAX_LIMIT = 50;

let socketServer = null;

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeLimit(limit, fallback = 20) {
  const value = Number(limit) || fallback;
  return Math.min(Math.max(value, 1), MAX_LIMIT);
}

function normalizeContent(content) {
  if (content === undefined || content === null) return "";
  return String(content).trim();
}

function fromUserInclude() {
  return {
    model: User,
    as: "fromUser",
    attributes: ["id", "username", "fullName", "avatar", "coverPhoto", "bio", "isVerified", "createdAt"]
  };
}

function serializeNotification(notification) {
  if (!notification) return null;
  return {
    id: notification.id,
    userId: notification.userId,
    fromUserId: notification.fromUserId,
    type: notification.type,
    referenceId: notification.referenceId,
    content: notification.content,
    isRead: notification.isRead,
    fromUser: toPublicUser(notification.fromUser, { includeEmail: false }),
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt
  };
}

function setSocketServer(io) {
  socketServer = io || null;
}

async function getUnreadCount(userId, options = {}) {
  return Notification.count({
    where: { userId, isRead: false },
    transaction: options.transaction
  });
}

async function emitNotificationState(userId, notification = null) {
  if (!socketServer) return;

  try {
    const unreadCount = await getUnreadCount(userId);
    if (notification) {
      socketServer.to(`user:${userId}`).emit("new_notification", { notification });
    }
    socketServer.to(`user:${userId}`).emit("notification_count", { unreadCount });
  } catch (error) {
    // Notification delivery must not break the primary user action.
  }
}

async function createNotification(payload, options = {}) {
  const userId = payload.userId;
  const fromUserId = payload.fromUserId || null;
  const type = payload.type;
  const content = normalizeContent(payload.content);

  if (!userId || (fromUserId && fromUserId === userId)) {
    return null;
  }
  if (!TYPES.includes(type)) {
    throw createError(400, "INVALID_NOTIFICATION_TYPE", "Invalid notification type");
  }
  if (!content) {
    throw createError(400, "NOTIFICATION_CONTENT_REQUIRED", "Notification content is required");
  }

  const row = await Notification.create(
    {
      userId,
      fromUserId,
      type,
      referenceId: payload.referenceId || null,
      content,
      isRead: false
    },
    { transaction: options.transaction }
  );

  const notification = await Notification.findByPk(row.id, {
    include: [fromUserInclude()],
    transaction: options.transaction
  });
  const serialized = serializeNotification(notification);

  if (!options.skipEmit) {
    emitNotificationState(userId, serialized).catch(() => {});
  }

  return serialized;
}

async function createOfflineMessageNotifications({ message, memberIds = [], isOnline = () => false }) {
  if (!message?.conversationId || !message?.senderId) return [];

  const receiverIds = Array.from(new Set(memberIds)).filter(
    (memberId) => memberId && memberId !== message.senderId && !isOnline(memberId)
  );

  return Promise.all(
    receiverIds.map((receiverId) =>
      createNotification({
        userId: receiverId,
        fromUserId: message.senderId,
        type: "message",
        referenceId: message.conversationId,
        content: "sent you a message"
      })
    )
  );
}

async function listNotifications(userId, { cursor, limit, status = "all" } = {}) {
  const normalizedStatus = status || "all";
  if (!STATUSES.includes(normalizedStatus)) {
    throw createError(400, "INVALID_NOTIFICATION_STATUS", "Invalid notification status");
  }
  if (cursor && Number.isNaN(new Date(cursor).getTime())) {
    throw createError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const normalizedLimit = normalizeLimit(limit);
  const where = {
    userId,
    ...(cursor ? { createdAt: { [Op.lt]: new Date(cursor) } } : {})
  };
  if (normalizedStatus === "unread") where.isRead = false;
  if (normalizedStatus === "read") where.isRead = true;

  const rows = await Notification.findAll({
    where,
    include: [fromUserInclude()],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"]
    ],
    limit: normalizedLimit + 1
  });

  const page = rows.slice(0, normalizedLimit);
  const hasMore = rows.length > normalizedLimit;
  return {
    notifications: page.map(serializeNotification),
    unreadCount: await getUnreadCount(userId),
    nextCursor: hasMore ? page[page.length - 1]?.createdAt?.toISOString() : null,
    hasMore
  };
}

async function markRead(userId, notificationId) {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
    include: [fromUserInclude()]
  });

  if (!notification) {
    throw createError(404, "NOTIFICATION_NOT_FOUND", "Notification not found");
  }

  if (!notification.isRead) {
    await notification.update({ isRead: true });
  }

  const unreadCount = await getUnreadCount(userId);
  emitNotificationState(userId).catch(() => {});
  return {
    notification: serializeNotification(notification),
    unreadCount
  };
}

async function markAllRead(userId) {
  await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
  emitNotificationState(userId).catch(() => {});
  return {
    unreadCount: 0
  };
}

module.exports = {
  TYPES,
  setSocketServer,
  getUnreadCount,
  createNotification,
  createOfflineMessageNotifications,
  listNotifications,
  markRead,
  markAllRead
};
