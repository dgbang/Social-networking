"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Posts", {
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
      content: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      media: {
        allowNull: false,
        type: Sequelize.JSONB,
        defaultValue: []
      },
      privacy: {
        allowNull: false,
        type: Sequelize.ENUM("public", "friends", "private"),
        defaultValue: "public"
      },
      originalPostId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: { model: "Posts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      likesCount: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      commentsCount: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      sharesCount: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isDeleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.createTable("Comments", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      postId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Posts", key: "id" },
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
      parentId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: { model: "Comments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      isDeleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.createTable("Likes", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      postId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: "Posts", key: "id" },
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
      type: {
        allowNull: false,
        type: Sequelize.ENUM("like", "love", "haha", "wow", "sad", "angry"),
        defaultValue: "like"
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

    await queryInterface.addIndex("Posts", ["userId"]);
    await queryInterface.addIndex("Posts", ["createdAt"]);
    await queryInterface.addIndex("Posts", ["privacy"]);
    await queryInterface.addIndex("Posts", ["originalPostId"]);
    await queryInterface.addIndex("Posts", ["isDeleted", "createdAt"]);
    await queryInterface.addIndex("Comments", ["postId"]);
    await queryInterface.addIndex("Comments", ["userId"]);
    await queryInterface.addIndex("Comments", ["parentId"]);
    await queryInterface.addIndex("Comments", ["createdAt"]);
    await queryInterface.addIndex("Likes", ["postId"]);
    await queryInterface.addIndex("Likes", ["userId"]);
    await queryInterface.addConstraint("Likes", {
      fields: ["postId", "userId"],
      type: "unique",
      name: "likes_post_user_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Likes");
    await queryInterface.dropTable("Comments");
    await queryInterface.dropTable("Posts");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Likes_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Posts_privacy";');
  }
};
