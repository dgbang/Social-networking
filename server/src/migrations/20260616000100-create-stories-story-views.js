"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Stories", {
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
      media: {
        allowNull: false,
        type: Sequelize.STRING
      },
      mediaPublicId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      mediaType: {
        allowNull: false,
        type: Sequelize.ENUM("image", "video")
      },
      text: {
        allowNull: true,
        type: Sequelize.STRING(160)
      },
      expiresAt: {
        allowNull: false,
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

    await queryInterface.createTable("StoryViews", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      storyId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Stories", key: "id" },
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
      viewedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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

    await queryInterface.addIndex("Stories", ["userId"]);
    await queryInterface.addIndex("Stories", ["expiresAt"]);
    await queryInterface.addIndex("Stories", ["deletedAt"]);
    await queryInterface.addIndex("Stories", ["userId", "expiresAt"]);
    await queryInterface.addIndex("StoryViews", ["storyId"]);
    await queryInterface.addIndex("StoryViews", ["userId"]);
    await queryInterface.addConstraint("StoryViews", {
      fields: ["storyId", "userId"],
      type: "unique",
      name: "story_views_story_user_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("StoryViews");
    await queryInterface.dropTable("Stories");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Stories_mediaType";');
  }
};
