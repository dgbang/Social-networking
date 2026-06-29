const { Op } = require("sequelize");
const { Story, StoryView, User, Friendship } = require("../models");
const toPublicUser = require("../utils/publicUser");
const uploadService = require("./upload.service");

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeLimit(limit, fallback = 30, max = 50) {
  const value = Number(limit) || fallback;
  return Math.min(Math.max(value, 1), max);
}

function normalizeText(text) {
  if (text === undefined || text === null) return null;
  const value = String(text).trim();
  return value || null;
}

function mediaType(file) {
  return file.mimetype?.startsWith("video/") ? "video" : "image";
}

function authorInclude() {
  return {
    model: User,
    as: "author",
    attributes: ["id", "username", "fullName", "avatar", "coverPhoto", "bio", "isVerified", "createdAt"]
  };
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

function isActiveStory(story) {
  return Boolean(story && !story.deletedAt && new Date(story.expiresAt).getTime() > Date.now());
}

async function canViewStory(story, viewerId) {
  if (!isActiveStory(story)) return false;
  if (story.userId === viewerId) return true;
  return areFriends(story.userId, viewerId);
}

async function serializeStory(story, viewerId, viewedIds = new Set()) {
  const storyId = story.id;
  const viewsCount = await StoryView.count({ where: { storyId } });
  return {
    id: story.id,
    userId: story.userId,
    media: story.media,
    mediaPublicId: story.userId === viewerId ? story.mediaPublicId : undefined,
    mediaType: story.mediaType,
    text: story.text,
    expiresAt: story.expiresAt,
    viewed: viewedIds.has(storyId) || story.userId === viewerId,
    viewsCount: story.userId === viewerId ? viewsCount : undefined,
    author: toPublicUser(story.author, { includeEmail: false }),
    createdAt: story.createdAt,
    updatedAt: story.updatedAt
  };
}

async function uploadStoryFile(file) {
  const type = mediaType(file);
  const result = await uploadService.uploadBuffer(file, "stories", type);
  return {
    media: result.url,
    mediaPublicId: result.publicId,
    mediaType: type
  };
}

async function createStory(userId, payload, files = []) {
  if (!files.length) {
    throw createError(400, "STORY_MEDIA_REQUIRED", "Story media is required");
  }
  if (files.length > 1) {
    throw createError(400, "STORY_SINGLE_MEDIA_ONLY", "Story can include one media file");
  }

  const text = normalizeText(payload.text);
  if (text && text.length > 160) {
    throw createError(400, "STORY_TEXT_TOO_LONG", "Story text is too long");
  }

  const uploaded = await uploadStoryFile(files[0]);
  try {
    const story = await Story.create({
      userId,
      ...uploaded,
      text,
      expiresAt: new Date(Date.now() + STORY_TTL_MS)
    });

    return getStory(story.id, userId);
  } catch (error) {
    uploadService.deleteMedia([{ publicId: uploaded.mediaPublicId, type: uploaded.mediaType }]).catch(() => {});
    throw error;
  }
}

async function getStory(storyId, viewerId) {
  const story = await Story.findOne({
    where: { id: storyId },
    include: [authorInclude()]
  });
  if (!story) {
    throw createError(404, "STORY_NOT_FOUND", "Story not found");
  }
  if (!(await canViewStory(story, viewerId))) {
    throw createError(403, "STORY_FORBIDDEN", "You cannot view this story");
  }
  const view = await StoryView.findOne({ where: { storyId, userId: viewerId } });
  return serializeStory(story, viewerId, new Set(view ? [storyId] : []));
}

async function listFeed(userId, { limit } = {}) {
  const normalizedLimit = normalizeLimit(limit);
  const friendIds = await getFriendIds(userId);
  const allowedUserIds = [userId, ...friendIds];

  const stories = await Story.findAll({
    where: {
      userId: { [Op.in]: allowedUserIds },
      deletedAt: null,
      expiresAt: { [Op.gt]: new Date() }
    },
    include: [authorInclude()],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"]
    ]
  });

  const storyIds = stories.map((story) => story.id);
  const views = storyIds.length
    ? await StoryView.findAll({
        where: {
          storyId: { [Op.in]: storyIds },
          userId
        }
      })
    : [];
  const viewedIds = new Set(views.map((view) => view.storyId));
  const groupsByUser = new Map();

  for (const story of stories) {
    const existing = groupsByUser.get(story.userId);
    if (!existing) {
      groupsByUser.set(story.userId, {
        user: toPublicUser(story.author, { includeEmail: false }),
        latestStoryAt: story.createdAt,
        unviewedCount: 0,
        stories: []
      });
    }

    const group = groupsByUser.get(story.userId);
    const serialized = await serializeStory(story, userId, viewedIds);
    group.stories.unshift(serialized);
    if (!serialized.viewed) {
      group.unviewedCount += 1;
    }
  }

  const groups = Array.from(groupsByUser.values())
    .sort((a, b) => new Date(b.latestStoryAt).getTime() - new Date(a.latestStoryAt).getTime())
    .slice(0, normalizedLimit);

  return { groups };
}

async function markViewed(storyId, userId) {
  const story = await Story.findOne({ where: { id: storyId }, include: [authorInclude()] });
  if (!story) {
    throw createError(404, "STORY_NOT_FOUND", "Story not found");
  }
  if (!(await canViewStory(story, userId))) {
    throw createError(403, "STORY_FORBIDDEN", "You cannot view this story");
  }

  await StoryView.findOrCreate({
    where: { storyId, userId },
    defaults: { storyId, userId, viewedAt: new Date() }
  });

  return serializeStory(story, userId, new Set([storyId]));
}

async function deleteStory(storyId, userId) {
  const story = await Story.findOne({ where: { id: storyId, deletedAt: null } });
  if (!story) {
    throw createError(404, "STORY_NOT_FOUND", "Story not found");
  }
  if (story.userId !== userId) {
    throw createError(403, "STORY_DELETE_FORBIDDEN", "You cannot delete this story");
  }

  await story.update({ deletedAt: new Date() });
  uploadService.deleteMedia([{ publicId: story.mediaPublicId, type: story.mediaType }]).catch(() => {});
}

async function expireOldStories(now = new Date()) {
  const expired = await Story.findAll({
    where: {
      deletedAt: null,
      expiresAt: { [Op.lte]: now }
    }
  });

  await Promise.all(
    expired.map(async (story) => {
      await story.update({ deletedAt: now });
      uploadService.deleteMedia([{ publicId: story.mediaPublicId, type: story.mediaType }]).catch(() => {});
    })
  );

  return expired.length;
}

module.exports = {
  STORY_TTL_MS,
  canViewStory,
  createStory,
  getStory,
  listFeed,
  markViewed,
  deleteStory,
  expireOldStories
};
