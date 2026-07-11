const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
  "Notification",
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
    fromUserId: DataTypes.UUID,
    type: {
      type: DataTypes.ENUM("like", "comment", "friend_request", "friend_accept", "share", "message"),
      allowNull: false
    },
    referenceId: DataTypes.UUID,
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: "Notifications"
  }
);

module.exports = Notification;
