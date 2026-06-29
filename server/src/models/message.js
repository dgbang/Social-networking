const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    replyToId: DataTypes.UUID,
    content: DataTypes.TEXT,
    media: DataTypes.JSONB,
    type: {
      type: DataTypes.ENUM("text", "image", "video", "file", "call"),
      allowNull: false,
      defaultValue: "text"
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deletedAt: DataTypes.DATE,
    deletedFor: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    }
  },
  {
    tableName: "Messages"
  }
);

module.exports = Message;
