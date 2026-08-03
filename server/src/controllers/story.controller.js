const storyService = require("../services/story.service");
const { success } = require("../utils/response");

async function create(req, res) {
  const story = await storyService.createStory(req.user.id, req.body, req.files || []);
  return success(res, req, {
    status: 201,
    message: "Đã tạo tin",
    data: { story }
  });
}

async function feed(req, res) {
  const result = await storyService.listFeed(req.user.id, req.query);
  return success(res, req, {
    message: "Danh sách tin",
    data: { groups: result.groups }
  });
}

async function view(req, res) {
  const story = await storyService.markViewed(req.params.id, req.user.id);
  return success(res, req, {
    message: "Đã xem tin",
    data: { story }
  });
}

async function remove(req, res) {
  await storyService.deleteStory(req.params.id, req.user.id);
  return success(res, req, {
    message: "Đã xóa tin",
    data: null
  });
}

module.exports = {
  create,
  feed,
  view,
  remove
};
