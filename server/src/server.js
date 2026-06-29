const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");
const { startStoryExpiryJob } = require("./jobs/storyExpiry.job");
const { setupSocket } = require("./socket");

async function start() {
  try {
    await sequelize.authenticate();
    const server = http.createServer(app);
    const io = setupSocket(server);
    app.set("io", io);
    server.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
    startStoryExpiryJob();
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
