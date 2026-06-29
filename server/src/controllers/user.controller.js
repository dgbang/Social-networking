const userService = require("../services/user.service");
const postService = require("../services/post.service");
const { success } = require("../utils/response");

async function me(req, res) {
  const user = await userService.getMe(req.user);
  return success(res, req, {
    message: "Current user profile",
    data: { user }
  });
}

async function updateMe(req, res) {
  const user = await userService.updateMe(req.user, req.body);
  return success(res, req, {
    message: "Profile updated",
    data: { user }
  });
}

async function getById(req, res) {
  const user = await userService.getById(req.params.id, req.user.id);
  return success(res, req, {
    message: "User profile",
    data: { user }
  });
}

async function search(req, res) {
  const users = await userService.searchUsers(req.query);
  return success(res, req, {
    message: "Users found",
    data: { users }
  });
}

async function uploadAvatar(req, res) {
  const user = await userService.uploadProfileImage(req.user, req.file, "avatar");
  return success(res, req, {
    message: "Avatar uploaded",
    data: { user }
  });
}

async function uploadCover(req, res) {
  const user = await userService.uploadProfileImage(req.user, req.file, "cover");
  return success(res, req, {
    message: "Cover photo uploaded",
    data: { user }
  });
}

async function posts(req, res) {
  const result = await postService.listUserPosts(req.user.id, req.params.id, req.query);
  return success(res, req, {
    message: "User posts",
    data: { posts: result.posts },
    meta: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    }
  });
}

async function onlineFriends(req, res) {
  const users = await userService.listOnlineFriends(req.user.id);
  return success(res, req, {
    message: "Online friends",
    data: { users }
  });
}

module.exports = {
  me,
  updateMe,
  getById,
  search,
  uploadAvatar,
  uploadCover,
  posts,
  onlineFriends
};
