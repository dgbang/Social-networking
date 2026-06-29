const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Like = sequelize.define(
  "Like",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM("like", "love", "haha", "wow", "sad", "angry"),
      allowNull: false,
      defaultValue: "like"
    }
  },
  {
    tableName: "Likes"
  }
);

module.exports = Like;
