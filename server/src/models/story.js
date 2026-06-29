const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Story = sequelize.define(
  "Story",
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
    media: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mediaPublicId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mediaType: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: false
    },
    text: {
      type: DataTypes.STRING(160),
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "Stories"
  }
);

module.exports = Story;
