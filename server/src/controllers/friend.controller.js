const friendService = require("../services/friend.service");
const { success } = require("../utils/response");

async function request(req, res) {
  const friendship = await friendService.sendRequest(req.user.id, req.params.userId);
  return success(res, req, {
    status: 201,
    message: "Friend request sent",
    data: { friendship }
  });
}

async function accept(req, res) {
  const { friendship, conversation } = await friendService.acceptRequest(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Friend request accepted",
    data: { friendship, conversation }
  });
}

async function reject(req, res) {
  const friendship = await friendService.rejectRequest(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Friend request rejected",
    data: { friendship }
  });
}

async function remove(req, res) {
  await friendService.unfriend(req.user.id, req.params.userId);
  return success(res, req, {
    message: "Friend removed",
    data: null
  });
}

async function list(req, res) {
  const friends = await friendService.listFriends(req.user.id, req.query.limit);
  return success(res, req, {
    message: "Friends list",
    data: { friends }
  });
}

async function requests(req, res) {
  const requests = await friendService.listRequests(req.user.id, req.query.limit);
  return success(res, req, {
    message: "Friend requests",
    data: { requests }
  });
}

async function suggestions(req, res) {
  const suggestions = await friendService.listSuggestions(req.user.id, req.query.limit);
  return success(res, req, {
    message: "Friend suggestions",
    data: { suggestions }
  });
}

module.exports = {
  request,
  accept,
  reject,
  remove,
  list,
  requests,
  suggestions
};
