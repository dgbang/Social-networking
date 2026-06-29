const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    content: DataTypes.TEXT,
    media: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    privacy: {
      type: DataTypes.ENUM("public", "friends", "private"),
      allowNull: false,
      defaultValue: "public"
    },
    originalPostId: DataTypes.UUID,
    likesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sharesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: "Posts"
  }
);

module.exports = Post;
