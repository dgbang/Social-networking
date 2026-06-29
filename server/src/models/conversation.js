const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM("private", "group"),
      allowNull: false
    },
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    adminId: DataTypes.UUID,
    lastMessageAt: DataTypes.DATE
  },
  {
    tableName: "Conversations"
  }
);

module.exports = Conversation;
