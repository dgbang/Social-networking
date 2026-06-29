"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuthSessions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      refreshTokenHash: Sequelize.STRING,
      sessionId: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      browserName: Sequelize.STRING,
      ipAddress: Sequelize.STRING,
      isVerified: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      verificationToken: Sequelize.STRING,
      verificationExpires: Sequelize.DATE,
      revokedAt: Sequelize.DATE,
      lastUsedAt: Sequelize.DATE,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex("AuthSessions", ["userId"]);
    await queryInterface.addIndex("AuthSessions", ["sessionId"], { unique: true });
    await queryInterface.addIndex("AuthSessions", ["verificationToken"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("AuthSessions");
  }
};
