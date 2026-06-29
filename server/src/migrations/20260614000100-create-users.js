"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      username: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      fullName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      avatar: Sequelize.STRING,
      coverPhoto: Sequelize.STRING,
      bio: Sequelize.TEXT,
      isVerified: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      verificationToken: Sequelize.STRING,
      resetPasswordToken: Sequelize.STRING,
      resetPasswordExpires: Sequelize.DATE,
      refreshTokenHash: Sequelize.STRING,
      isOnline: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      lastSeen: Sequelize.DATE,
      fcmToken: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex("Users", ["email"], { unique: true });
    await queryInterface.addIndex("Users", ["username"], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Users");
  }
};
