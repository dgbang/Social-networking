const { sequelize, Post, Comment, User } = require("../models");
const toPublicUser = require("../utils/publicUser");
const notificationService = require("./notification.service");
const postService = require("./post.service");

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeLimit(limit, fallback = 20, max = 50) {
  const value = Number(limit) || fallback;
  return Math.min(Math.max(value, 1), max);
}

function normalizeContent(content) {
  if (content === undefined || content === null) return "";
  return String(content).trim();
}

function authorInclude() {
  return {
    model: User,
    as: "author",
    attributes: ["id", "username", "fullName", "avatar", "coverPhoto", "bio", "isVerified", "createdAt"]
  };
}

function serializeComment(comment) {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    parentId: comment.parentId,
    content: comment.content,
    author: toPublicUser(comment.author, { includeEmail: false }),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt
  };
}

async function listComments(postId, viewerId, { cursor, limit, parentId } = {}) {
  await postService.getPost(postId, viewerId);
  if (cursor && Number.isNaN(new Date(cursor).getTime())) {
    throw createError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const normalizedLimit = normalizeLimit(limit);
  const comments = await Comment.findAll({
    where: {
      postId,
      parentId: parentId || null,
      isDeleted: false,
      ...(cursor ? { createdAt: { [require("sequelize").Op.gt]: new Date(cursor) } } : {})
    },
    include: [authorInclude()],
    order: [
      ["createdAt", "ASC"],
      ["id", "ASC"]
    ],
    limit: normalizedLimit + 1
  });

  const page = comments.slice(0, normalizedLimit);
  const hasMore = comments.length > normalizedLimit;
  return {
    comments: page.map(serializeComment),
    nextCursor: hasMore ? page[page.length - 1]?.createdAt?.toISOString() : null,
    hasMore
  };
}

async function createComment(postId, userId, payload) {
  const content = normalizeContent(payload.content);
  if (!content) {
    throw createError(400, "COMMENT_VALIDATION_ERROR", "Comment content is required");
  }

  const post = await postService.getPost(postId, userId);
  const parentId = payload.parentId || null;

  if (parentId) {
    const parent = await Comment.findOne({
      where: { id: parentId, postId, isDeleted: false }
    });
    if (!parent) {
      throw createError(400, "COMMENT_PARENT_INVALID", "Parent comment is invalid");
    }
  }

  const comment = await sequelize.transaction(async (transaction) => {
    const created = await Comment.create(
      {
        postId,
        userId,
        parentId,
        content
      },
      { transaction }
    );
    await Post.increment("commentsCount", { by: 1, where: { id: postId }, transaction });
    return created;
  });

  notificationService
    .createNotification({
      userId: post.userId,
      fromUserId: userId,
      type: "comment",
      referenceId: postId,
      content: "commented on your post"
    })
    .catch(() => {});

  return Comment.findByPk(comment.id, { include: [authorInclude()] }).then(serializeComment);
}

async function deleteComment(commentId, userId) {
  const comment = await Comment.findOne({
    where: { id: commentId, isDeleted: false },
    include: [{ model: Post, as: "post" }]
  });

  if (!comment) {
    throw createError(404, "COMMENT_NOT_FOUND", "Comment not found");
  }

  if (comment.userId !== userId) {
    throw createError(403, "COMMENT_FORBIDDEN", "You cannot delete this comment");
  }

  await sequelize.transaction(async (transaction) => {
    await comment.update({ isDeleted: true }, { transaction });
    await Post.decrement("commentsCount", { by: 1, where: { id: comment.postId }, transaction });
  });
}

module.exports = {
  listComments,
  createComment,
  deleteComment
};
