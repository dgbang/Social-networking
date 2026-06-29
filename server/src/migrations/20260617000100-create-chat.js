"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Conversations", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM("private", "group")
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      avatar: {
        allowNull: true,
        type: Sequelize.STRING
      },
      adminId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      lastMessageAt: {
        allowNull: true,
        type: Sequelize.DATE
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

    await queryInterface.createTable("ConversationMembers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      conversationId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Conversations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      role: {
        allowNull: false,
        type: Sequelize.ENUM("member", "admin"),
        defaultValue: "member"
      },
      joinedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      lastReadAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
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

    await queryInterface.createTable("Messages", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      conversationId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Conversations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      senderId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      replyToId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: { model: "Messages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      content: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      media: {
        allowNull: true,
        type: Sequelize.JSONB
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM("text", "image", "video", "file", "call"),
        defaultValue: "text"
      },
      isDeleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deletedFor: {
        allowNull: false,
        type: Sequelize.JSONB,
        defaultValue: []
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

    await queryInterface.addIndex("Conversations", ["type"]);
    await queryInterface.addIndex("Conversations", ["adminId"]);
    await queryInterface.addIndex("Conversations", ["lastMessageAt"]);
    await queryInterface.addIndex("ConversationMembers", ["conversationId"]);
    await queryInterface.addIndex("ConversationMembers", ["userId"]);
    await queryInterface.addIndex("ConversationMembers", ["deletedAt"]);
    await queryInterface.addConstraint("ConversationMembers", {
      fields: ["conversationId", "userId"],
      type: "unique",
      name: "conversation_members_conversation_user_unique"
    });
    await queryInterface.addIndex("Messages", ["conversationId"]);
    await queryInterface.addIndex("Messages", ["senderId"]);
    await queryInterface.addIndex("Messages", ["replyToId"]);
    await queryInterface.addIndex("Messages", ["conversationId", "createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Messages");
    await queryInterface.dropTable("ConversationMembers");
    await queryInterface.dropTable("Conversations");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Messages_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ConversationMembers_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Conversations_type";');
  }
};
