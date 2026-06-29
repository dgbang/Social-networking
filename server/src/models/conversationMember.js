const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ConversationMember = sequelize.define(
  "ConversationMember",
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("member", "admin"),
      allowNull: false,
      defaultValue: "member"
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    lastReadAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  },
  {
    tableName: "ConversationMembers"
  }
);

module.exports = ConversationMember;
