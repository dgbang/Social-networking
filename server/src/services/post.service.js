const { Op } = require("sequelize");
const { sequelize, Post, User, Friendship, Like } = require("../models");
const toPublicUser = require("../utils/publicUser");
const notificationService = require("./notification.service");
const uploadService = require("./upload.service");

const PRIVACY = ["public", "friends", "private"];
const REACTIONS = ["like", "love", "haha", "wow", "sad", "angry"];

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeLimit(limit, fallback = 10, max = 20) {
  const value = Number(limit) || fallback;
  return Math.min(Math.max(value, 1), max);
}

function normalizeContent(content) {
  if (content === undefined || content === null) return "";
  return String(content).trim();
}

function mediaType(file) {
  return file.mimetype?.startsWith("video/") ? "video" : "image";
}

async function uploadPostFiles(files = []) {
  if (!files.length) return [];
  const uploaded = [];
  try {
    for (const file of files) {
      const type = mediaType(file);
      const result = await uploadService.uploadBuffer(file, "posts", type);
      uploaded.push({
        url: result.url,
        publicId: result.publicId,
        type
      });
    }
    return uploaded;
  } catch (error) {
    uploadService.deleteMedia(uploaded).catch(() => {});
    throw error;
  }
}

async function areFriends(userA, userB) {
  if (!userA || !userB || userA === userB) return false;
  const friendship = await Friendship.findOne({
    where: {
      status: "accepted",
      [Op.or]: [
        { requesterId: userA, addresseeId: userB },
        { requesterId: userB, addresseeId: userA }
      ]
    }
  });
  return Boolean(friendship);
}

async function canViewPost(post, viewerId) {
  if (!post || post.isDeleted) return false;
  if (post.userId === viewerId) return true;
  if (post.privacy === "public") return true;
  if (post.privacy === "friends") return areFriends(post.userId, viewerId);
  return false;
}

function authorInclude() {
  return {
    model: User,
    as: "author",
    attributes: ["id", "username", "fullName", "avatar", "coverPhoto", "bio", "isVerified", "createdAt"]
  };
}

function originalPostInclude() {
  return {
    model: Post,
    as: "originalPost",
    include: [authorInclude()]
  };
}

async function attachCurrentReaction(post, viewerId) {
  if (!post?.id) return null;
  const reaction = await Like.findOne({
    where: {
      postId: post.id,
      userId: viewerId
    }
  });
  return reaction ? { type: reaction.type } : null;
}

async function serializePost(post, viewerId, { includeReaction = true } = {}) {
  if (!post) return null;
  const original = post.originalPost ? post.originalPost : null;
  const canViewOriginal = original ? await canViewPost(original, viewerId) : false;

  return {
    id: post.id,
    userId: post.userId,
    content: post.content,
    media: post.media || [],
    privacy: post.privacy,
    originalPostId: post.originalPostId,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    sharesCount: post.sharesCount,
    isDeleted: post.isDeleted,
    author: toPublicUser(post.author, { includeEmail: false }),
    originalPost: canViewOriginal
      ? {
          id: original.id,
          userId: original.userId,
          content: original.content,
          media: original.media || [],
          privacy: original.privacy,
          author: toPublicUser(original.author, { includeEmail: false }),
          createdAt: original.createdAt
        }
      : null,
    currentReaction: includeReaction ? await attachCurrentReaction(post, viewerId) : null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

async function findVisiblePost(postId, viewerId, options = {}) {
  const post = await Post.findOne({
    where: { id: postId, isDeleted: false },
    include: [authorInclude(), originalPostInclude()],
    transaction: options.transaction
  });

  if (!post) {
    throw createError(404, "POST_NOT_FOUND", "Post not found");
  }

  if (!(await canViewPost(post, viewerId))) {
    throw createError(403, "POST_FORBIDDEN", "You cannot view this post");
  }

  return post;
}

async function createPost(userId, payload, files = []) {
  const content = normalizeContent(payload.content);
  const privacy = payload.privacy || "public";

  if (!PRIVACY.includes(privacy)) {
    throw createError(400, "INVALID_POST_PRIVACY", "Invalid post privacy");
  }

  const media = await uploadPostFiles(files);
  if (!content && media.length === 0) {
    throw createError(400, "POST_MEDIA_REQUIRED", "Post content or media is required");
  }

  try {
    const post = await Post.create({
      userId,
      content: content || null,
      media,
      privacy
    });

    return getPost(post.id, userId);
  } catch (error) {
    uploadService.deleteMedia(media).catch(() => {});
    throw error;
  }
}

async function getFriendIds(userId) {
  const rows = await Friendship.findAll({
    where: {
      status: "accepted",
      [Op.or]: [{ requesterId: userId }, { addresseeId: userId }]
    }
  });
  return rows.map((row) => (row.requesterId === userId ? row.addresseeId : row.requesterId));
}

async function listFeed(userId, { cursor, limit } = {}) {
  const normalizedLimit = normalizeLimit(limit);
  const friendIds = await getFriendIds(userId);
  const createdAtFilter = cursor ? { createdAt: { [Op.lt]: new Date(cursor) } } : {};

  if (cursor && Number.isNaN(new Date(cursor).getTime())) {
    throw createError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const posts = await Post.findAll({
    where: {
      isDeleted: false,
      ...createdAtFilter,
      [Op.or]: [
        { privacy: "public" },
        { userId },
        { privacy: "friends", userId: { [Op.in]: friendIds } }
      ]
    },
    include: [authorInclude(), originalPostInclude()],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"]
    ],
    limit: normalizedLimit + 1
  });

  const page = posts.slice(0, normalizedLimit);
  const hasMore = posts.length > normalizedLimit;
  return {
    posts: await Promise.all(page.map((post) => serializePost(post, userId))),
    nextCursor: hasMore ? page[page.length - 1]?.createdAt?.toISOString() : null,
    hasMore
  };
}

async function listUserPosts(viewerId, userId, { cursor, limit } = {}) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw createError(404, "USER_NOT_FOUND", "User not found");
  }

  const normalizedLimit = normalizeLimit(limit);
  if (cursor && Number.isNaN(new Date(cursor).getTime())) {
    throw createError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const privacyFilter =
    viewerId === userId
      ? {}
      : (await areFriends(viewerId, userId))
        ? { privacy: { [Op.in]: ["public", "friends"] } }
        : { privacy: "public" };

  const posts = await Post.findAll({
    where: {
      userId,
      isDeleted: false,
      ...privacyFilter,
      ...(cursor ? { createdAt: { [Op.lt]: new Date(cursor) } } : {})
    },
    include: [authorInclude(), originalPostInclude()],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"]
    ],
    limit: normalizedLimit + 1
  });

  const page = posts.slice(0, normalizedLimit);
  const hasMore = posts.length > normalizedLimit;
  return {
    posts: await Promise.all(page.map((post) => serializePost(post, viewerId))),
    nextCursor: hasMore ? page[page.length - 1]?.createdAt?.toISOString() : null,
    hasMore
  };
}

async function getPost(postId, viewerId) {
  const post = await findVisiblePost(postId, viewerId);
  return serializePost(post, viewerId);
}

async function updatePost(postId, userId, payload, files = []) {
  const post = await Post.findOne({ where: { id: postId, isDeleted: false } });
  if (!post) {
    throw createError(404, "POST_NOT_FOUND", "Post not found");
  }
  if (post.userId !== userId) {
    throw createError(403, "POST_UPDATE_FORBIDDEN", "You cannot update this post");
  }

  const update = {};
  if (Object.prototype.hasOwnProperty.call(payload, "privacy")) {
    if (!PRIVACY.includes(payload.privacy)) {
      throw createError(400, "INVALID_POST_PRIVACY", "Invalid post privacy");
    }
    update.privacy = payload.privacy;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "content")) {
    update.content = normalizeContent(payload.content) || null;
  }

  const newMedia = await uploadPostFiles(files);
  const replacingMedia = newMedia.length > 0;
  if (replacingMedia) {
    update.media = newMedia;
  }

  const nextContent = Object.prototype.hasOwnProperty.call(update, "content") ? update.content : post.content;
  const nextMedia = replacingMedia ? newMedia : post.media || [];
  if (!normalizeContent(nextContent) && nextMedia.length === 0) {
    throw createError(400, "POST_MEDIA_REQUIRED", "Post content or media is required");
  }

  const oldMedia = post.media || [];
  await post.update(update);
  if (replacingMedia && oldMedia.length) {
    uploadService.deleteMedia(oldMedia).catch(() => {});
  }
  return getPost(post.id, userId);
}

async function deletePost(postId, userId) {
  const post = await Post.findOne({ where: { id: postId, isDeleted: false } });
  if (!post) {
    throw createError(404, "POST_NOT_FOUND", "Post not found");
  }
  if (post.userId !== userId) {
    throw createError(403, "POST_DELETE_FORBIDDEN", "You cannot delete this post");
  }
  await post.update({ isDeleted: true });
}

async function toggleReaction(postId, userId, type = "like") {
  if (!REACTIONS.includes(type)) {
    throw createError(400, "INVALID_REACTION_TYPE", "Invalid reaction type");
  }

  await findVisiblePost(postId, userId);

  let notificationTargetId = null;
  const result = await sequelize.transaction(async (transaction) => {
    const post = await Post.findOne({
      where: { id: postId, isDeleted: false },
      transaction,
      lock: transaction.LOCK?.UPDATE || true
    });
    const existing = await Like.findOne({ where: { postId, userId }, transaction });

    if (!existing) {
      await Like.create({ postId, userId, type }, { transaction });
      await post.increment("likesCount", { by: 1, transaction });
      await post.reload({ transaction });
      notificationTargetId = post.userId;
      return { reaction: { type }, likesCount: post.likesCount };
    }

    if (existing.type === type) {
      await existing.destroy({ transaction });
      await post.decrement("likesCount", { by: 1, transaction });
      await post.reload({ transaction });
      return { reaction: null, likesCount: Math.max(post.likesCount, 0) };
    }

    await existing.update({ type }, { transaction });
    return { reaction: { type }, likesCount: post.likesCount };
  });

  if (notificationTargetId) {
    notificationService
      .createNotification({
        userId: notificationTargetId,
        fromUserId: userId,
        type: "like",
        referenceId: postId,
        content: `reacted ${type} to your post`
      })
      .catch(() => {});
  }

  return result;
}

async function sharePost(postId, userId, payload) {
  const originalPost = await findVisiblePost(postId, userId);
  const privacy = payload.privacy || "public";
  if (!PRIVACY.includes(privacy)) {
    throw createError(400, "INVALID_POST_PRIVACY", "Invalid post privacy");
  }

  const content = normalizeContent(payload.content);
  const shared = await sequelize.transaction(async (transaction) => {
    const post = await Post.create(
      {
        userId,
        content: content || null,
        media: [],
        privacy,
        originalPostId: originalPost.id
      },
      { transaction }
    );
    await Post.increment("sharesCount", { by: 1, where: { id: originalPost.id }, transaction });
    return post;
  });

  notificationService
    .createNotification({
      userId: originalPost.userId,
      fromUserId: userId,
      type: "share",
      referenceId: originalPost.id,
      content: "shared your post"
    })
    .catch(() => {});

  return getPost(shared.id, userId);
}

module.exports = {
  PRIVACY,
  REACTIONS,
  canViewPost,
  createPost,
  listFeed,
  listUserPosts,
  getPost,
  updatePost,
  deletePost,
  toggleReaction,
  sharePost
};
