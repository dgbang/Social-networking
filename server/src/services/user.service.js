const { Op } = require("sequelize");
const { User, Friendship } = require("../models");
const toPublicUser = require("../utils/publicUser");
const uploadService = require("./upload.service");
const onlineUsers = require("../socket/onlineUsers");

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function serializeProfile(user, viewerId) {
  const isOwner = user.id === viewerId;
  return toPublicUser(user, {
    includeEmail: isOwner,
    includePublicIds: isOwner
  });
}

async function getMe(user) {
  return toPublicUser(user, { includeEmail: true, includePublicIds: true });
}

async function updateMe(user, payload) {
  const update = {};
  if (Object.prototype.hasOwnProperty.call(payload, "fullName")) {
    update.fullName = payload.fullName;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "bio")) {
    update.bio = payload.bio;
  }

  await user.update(update);
  return getMe(user);
}

async function getById(id, viewerId) {
  const user = await User.findByPk(id);
  if (!user) {
    throw createError(404, "USER_NOT_FOUND", "User not found");
  }
  return serializeProfile(user, viewerId);
}

async function searchUsers({ q, limit = 10 }) {
  const normalizedLimit = Math.min(Number(limit) || 10, 20);
  const query = q.trim();
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.iLike]: `%${query}%` } },
        { fullName: { [Op.iLike]: `%${query}%` } }
      ]
    },
    limit: normalizedLimit,
    order: [["fullName", "ASC"]]
  });

  return users.map((user) => toPublicUser(user, { includeEmail: false }));
}

async function uploadProfileImage(user, file, type) {
  if (!file) {
    throw createError(400, "UPLOAD_FILE_REQUIRED", "Image file is required");
  }

  const isAvatar = type === "avatar";
  const urlField = isAvatar ? "avatar" : "coverPhoto";
  const publicIdField = isAvatar ? "avatarPublicId" : "coverPhotoPublicId";
  const oldPublicId = user[publicIdField];
  const uploaded = await uploadService.uploadBuffer(file, isAvatar ? "avatars" : "covers");

  await user.update({
    [urlField]: uploaded.url,
    [publicIdField]: uploaded.publicId
  });

  if (oldPublicId) {
    uploadService.deleteByPublicId(oldPublicId).catch((error) => {
      if (process.env.NODE_ENV !== "test") {
        console.error("Failed to delete old Cloudinary image", {
          publicId: oldPublicId,
          message: error.message
        });
      }
    });
  }

  return getMe(user);
}

async function listOnlineFriends(currentUserId) {
  const rows = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      status: "accepted"
    }
  });
  const onlineFriendIds = rows
    .map((row) => (row.requesterId === currentUserId ? row.addresseeId : row.requesterId))
    .filter((id) => onlineUsers.isOnline(id));

  if (!onlineFriendIds.length) return [];
  const users = await User.findAll({
    where: { id: { [Op.in]: onlineFriendIds } },
    order: [["fullName", "ASC"]]
  });
  return users.map((user) => toPublicUser(user, { includeEmail: false }));
}

module.exports = {
  getMe,
  updateMe,
  getById,
  searchUsers,
  uploadProfileImage,
  listOnlineFriends
};
