"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      fromUserId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM("like", "comment", "friend_request", "friend_accept", "share", "message")
      },
      referenceId: {
        allowNull: true,
        type: Sequelize.UUID
      },
      content: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isRead: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex("Notifications", ["userId", "createdAt"]);
    await queryInterface.addIndex("Notifications", ["userId", "isRead", "createdAt"]);
    await queryInterface.addIndex("Notifications", ["type", "referenceId"]);
    await queryInterface.addIndex("Notifications", ["fromUserId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Notifications");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_type";');
  }
};
