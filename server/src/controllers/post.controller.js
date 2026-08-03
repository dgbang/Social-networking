const postService = require("../services/post.service");
const commentService = require("../services/comment.service");
const { success } = require("../utils/response");

async function create(req, res) {
  const post = await postService.createPost(req.user.id, req.body, req.files || []);
  return success(res, req, {
    status: 201,
    message: "Đã tạo bài viết",
    data: { post }
  });
}

async function feed(req, res) {
  const result = await postService.listFeed(req.user.id, req.query);
  return success(res, req, {
    message: "Bảng tin",
    data: { posts: result.posts },
    meta: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    }
  });
}

async function detail(req, res) {
  const post = await postService.getPost(req.params.id, req.user.id);
  return success(res, req, {
    message: "Chi tiết bài viết",
    data: { post }
  });
}

async function update(req, res) {
  const post = await postService.updatePost(req.params.id, req.user.id, req.body, req.files || []);
  return success(res, req, {
    message: "Đã cập nhật bài viết",
    data: { post }
  });
}

async function remove(req, res) {
  await postService.deletePost(req.params.id, req.user.id);
  return success(res, req, {
    message: "Đã xóa bài viết",
    data: null
  });
}

async function react(req, res) {
  const result = await postService.toggleReaction(req.params.id, req.user.id, req.body.type || "like");
  return success(res, req, {
    message: "Đã cập nhật cảm xúc",
    data: result
  });
}

async function listComments(req, res) {
  const result = await commentService.listComments(req.params.id, req.user.id, req.query);
  return success(res, req, {
    message: "Bình luận của bài viết",
    data: { comments: result.comments },
    meta: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    }
  });
}

async function createComment(req, res) {
  const comment = await commentService.createComment(req.params.id, req.user.id, req.body);
  return success(res, req, {
    status: 201,
    message: "Đã tạo bình luận",
    data: { comment }
  });
}

async function share(req, res) {
  const post = await postService.sharePost(req.params.id, req.user.id, req.body);
  return success(res, req, {
    status: 201,
    message: "Đã chia sẻ bài viết",
    data: { post }
  });
}

module.exports = {
  create,
  feed,
  detail,
  update,
  remove,
  react,
  listComments,
  createComment,
  share
};
