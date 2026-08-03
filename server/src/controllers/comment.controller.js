const commentService = require("../services/comment.service");
const { success } = require("../utils/response");

async function remove(req, res) {
  await commentService.deleteComment(req.params.id, req.user.id);
  return success(res, req, {
    message: "Đã xóa bình luận",
    data: null
  });
}

module.exports = {
  remove
};
