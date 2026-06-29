"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Friendships", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      requesterId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      addresseeId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("pending", "accepted", "rejected", "blocked"),
        defaultValue: "pending"
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

    await queryInterface.addConstraint("Friendships", {
      fields: ["requesterId", "addresseeId"],
      type: "unique",
      name: "friendships_requester_addressee_unique"
    });
    await queryInterface.addConstraint("Friendships", {
      fields: ["requesterId", "addresseeId"],
      type: "check",
      name: "friendships_no_self_request",
      where: {
        requesterId: { [Sequelize.Op.ne]: Sequelize.col("addresseeId") }
      }
    });
    await queryInterface.addIndex("Friendships", ["requesterId"]);
    await queryInterface.addIndex("Friendships", ["addresseeId"]);
    await queryInterface.addIndex("Friendships", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Friendships");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Friendships_status";');
  }
};
