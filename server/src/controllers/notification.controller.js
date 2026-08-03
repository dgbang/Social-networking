const notificationService = require("../services/notification.service");
const { success } = require("../utils/response");

async function list(req, res) {
  const result = await notificationService.listNotifications(req.user.id, req.query);
  return success(res, req, {
    message: "Danh sách thông báo",
    data: {
      notifications: result.notifications,
      unreadCount: result.unreadCount
    },
    meta: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    }
  });
}

async function read(req, res) {
  const result = await notificationService.markRead(req.user.id, req.params.id);
  return success(res, req, {
    message: "Đã đánh dấu thông báo là đã đọc",
    data: result
  });
}

async function readAll(req, res) {
  const result = await notificationService.markAllRead(req.user.id);
  return success(res, req, {
    message: "Đã đánh dấu tất cả thông báo là đã đọc",
    data: result
  });
}

module.exports = {
  list,
  read,
  readAll
};
