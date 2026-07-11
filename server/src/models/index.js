const sequelize = require("../config/database");
const User = require("./user");
const AuthSession = require("./authSession");
const Friendship = require("./friendship");
const Post = require("./post");
const Comment = require("./comment");
const Like = require("./like");
const Story = require("./story");
const StoryView = require("./storyView");
const Conversation = require("./conversation");
const ConversationMember = require("./conversationMember");
const Message = require("./message");
const Notification = require("./notification");

User.hasMany(AuthSession, { foreignKey: "userId", as: "sessions" });
AuthSession.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Friendship, { foreignKey: "requesterId", as: "sentFriendRequests" });
User.hasMany(Friendship, { foreignKey: "addresseeId", as: "receivedFriendRequests" });
Friendship.belongsTo(User, { foreignKey: "requesterId", as: "requester" });
Friendship.belongsTo(User, { foreignKey: "addresseeId", as: "addressee" });

User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "author" });
Post.belongsTo(Post, { foreignKey: "originalPostId", as: "originalPost" });
Post.hasMany(Post, { foreignKey: "originalPostId", as: "shares" });

Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });
Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" });

Post.hasMany(Like, { foreignKey: "postId", as: "likes" });
Like.belongsTo(Post, { foreignKey: "postId", as: "post" });
Like.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Story, { foreignKey: "userId", as: "stories" });
Story.belongsTo(User, { foreignKey: "userId", as: "author" });
Story.hasMany(StoryView, { foreignKey: "storyId", as: "views" });
StoryView.belongsTo(Story, { foreignKey: "storyId", as: "story" });
StoryView.belongsTo(User, { foreignKey: "userId", as: "viewer" });

User.hasMany(ConversationMember, { foreignKey: "userId", as: "conversationMemberships" });
Conversation.hasMany(ConversationMember, { foreignKey: "conversationId", as: "members" });
ConversationMember.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
ConversationMember.belongsTo(User, { foreignKey: "userId", as: "user" });
Conversation.belongsTo(User, { foreignKey: "adminId", as: "admin" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(Message, { foreignKey: "replyToId", as: "replyTo" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "recipient" });
Notification.belongsTo(User, { foreignKey: "fromUserId", as: "fromUser" });

module.exports = {
  sequelize,
  User,
  AuthSession,
  Friendship,
  Post,
  Comment,
  Like,
  Story,
  StoryView,
  Conversation,
  ConversationMember,
  Message,
  Notification
};
