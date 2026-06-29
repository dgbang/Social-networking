const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuthSession = sequelize.define(
  "AuthSession",
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
    refreshTokenHash: DataTypes.STRING,
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    browserName: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    verificationExpires: DataTypes.DATE,
    revokedAt: DataTypes.DATE,
    lastUsedAt: DataTypes.DATE
  },
  {
    tableName: "AuthSessions"
  }
);

module.exports = AuthSession;
