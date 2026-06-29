const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: DataTypes.STRING,
    avatarPublicId: DataTypes.STRING,
    coverPhoto: DataTypes.STRING,
    coverPhotoPublicId: DataTypes.STRING,
    bio: DataTypes.TEXT,
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    refreshTokenHash: DataTypes.STRING,
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastSeen: DataTypes.DATE,
    fcmToken: DataTypes.STRING
  },
  {
    tableName: "Users"
  }
);

module.exports = User;
