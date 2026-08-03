const friendService = require("../services/friend.service");
const { success } = require("../utils/response");

async function relationship(req, res) {
  const friendship = await friendService.getRelationship(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Trạng thái kết bạn",
    data: { friendship }
  });
}

async function request(req, res) {
  const friendship = await friendService.sendRequest(req.user.id, req.params.userId);
  return success(res, req, {
    status: 201,
    message: "Đã gửi lời mời kết bạn",
    data: { friendship }
  });
}

async function accept(req, res) {
  const { friendship, conversation } = await friendService.acceptRequest(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Đã chấp nhận lời mời kết bạn",
    data: { friendship, conversation }
  });
}

async function reject(req, res) {
  const friendship = await friendService.rejectRequest(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Đã từ chối lời mời kết bạn",
    data: { friendship }
  });
}

async function remove(req, res) {
  await friendService.unfriend(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Đã hủy kết bạn",
    data: null
  });
}

async function list(req, res) {
  const friends = await friendService.listFriends(req.user.id, req.query.limit);
  return success(res, req, {
    message: "Danh sách bạn bè",
    data: { friends }
  });
}

async function requests(req, res) {
  const requests = await friendService.listRequests(req.user.id, req.query.limit);
  return success(res, req, {
    message: "Danh sách lời mời kết bạn",
    data: { requests }
  });
}

async function suggestions(req, res) {
  const suggestions = await friendService.listSuggestions(req.user.id, req.query.limit);
  return success(res, req, {
    message: "Danh sách gợi ý kết bạn",
    data: { suggestions }
  });
}

module.exports = {
  relationship,
  request,
  accept,
  reject,
  remove,
  list,
  requests,
  suggestions
};
