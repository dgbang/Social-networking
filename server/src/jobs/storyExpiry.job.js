const cron = require("node-cron");
const storyService = require("../services/story.service");

function startStoryExpiryJob() {
  return cron.schedule("*/15 * * * *", async () => {
    try {
      await storyService.expireOldStories();
    } catch (error) {
      console.error("Tác vụ xóa tin hết hạn thất bại", error);
    }
  });
}

module.exports = {
  startStoryExpiryJob
};
