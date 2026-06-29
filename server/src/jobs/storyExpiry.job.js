const cron = require("node-cron");
const storyService = require("../services/story.service");

function startStoryExpiryJob() {
  return cron.schedule("*/15 * * * *", async () => {
    try {
      await storyService.expireOldStories();
    } catch (error) {
      console.error("Story expiry job failed", error);
    }
  });
}

module.exports = {
  startStoryExpiryJob
};
