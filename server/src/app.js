const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const requestId = require("./middlewares/requestId");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const friendRoutes = require("./routes/friend.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const storyRoutes = require("./routes/story.routes");
const conversationRoutes = require("./routes/conversation.routes");
const messageRoutes = require("./routes/message.routes");
const { fail } = require("./utils/response");

const app = express();

app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(morgan(env.nodeEnv === "test" ? "tiny" : "dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) =>
  fail(res, req, {
    status: 404,
    code: "NOT_FOUND",
    message: "Route not found"
  })
);

app.use(errorHandler);

module.exports = app;
