const { Op } = require("sequelize");
const { Friendship, User } = require("../models");
const chatService = require("./chat.service");
const toPublicUser = require("../utils/publicUser");

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function ensureUserExists(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw createError(404, "USER_NOT_FOUND", "User not found");
  }
  return user;
}

function pairWhere(userA, userB) {
  return {
    [Op.or]: [
      { requesterId: userA, addresseeId: userB },
      { requesterId: userB, addresseeId: userA }
    ]
  };
}

async function findPair(userA, userB) {
  return Friendship.findOne({ where: pairWhere(userA, userB) });
}

async function sendRequest(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    throw createError(400, "FRIEND_REQUEST_SELF", "Cannot send friend request to yourself");
  }

  await ensureUserExists(targetUserId);
  const existing = await findPair(currentUserId, targetUserId);

  if (existing?.status === "rejected") {
    await existing.update({
      requesterId: currentUserId,
      addresseeId: targetUserId,
      status: "pending"
    });
    return existing;
  }

  if (existing?.status === "accepted") {
    throw createError(409, "ALREADY_FRIENDS", "Users are already friends");
  }

  if (existing) {
    throw createError(409, "FRIEND_REQUEST_EXISTS", "Friend request already exists");
  }

  return Friendship.create({
    requesterId: currentUserId,
    addresseeId: targetUserId,
    status: "pending"
  });
}

async function acceptRequest(currentUserId, requesterId) {
  const friendship = await Friendship.findOne({
    where: {
      requesterId,
      addresseeId: currentUserId,
      status: "pending"
    }
  });

  if (!friendship) {
    throw createError(404, "FRIEND_REQUEST_NOT_FOUND", "Friend request not found");
  }

  await friendship.update({ status: "accepted" });
  const conversation = await chatService.createConversation(currentUserId, {
    type: "private",
    memberIds: [requesterId]
  });
  return { friendship, conversation };
}

async function rejectRequest(currentUserId, requesterId) {
  const friendship = await Friendship.findOne({
    where: {
      requesterId,
      addresseeId: currentUserId,
      status: "pending"
    }
  });

  if (!friendship) {
    throw createError(404, "FRIEND_REQUEST_NOT_FOUND", "Friend request not found");
  }

  await friendship.update({ status: "rejected" });
  return friendship;
}

async function unfriend(currentUserId, userId) {
  const friendship = await Friendship.findOne({
    where: {
      ...pairWhere(currentUserId, userId),
      status: "accepted"
    }
  });

  if (!friendship) {
    throw createError(404, "FRIENDSHIP_NOT_FOUND", "Friendship not found");
  }

  await friendship.destroy();
}

async function listFriends(currentUserId, limit = 20) {
  const rows = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      status: "accepted"
    }
  });

  const friendIds = rows.map((row) => (row.requesterId === currentUserId ? row.addresseeId : row.requesterId));
  const users = await User.findAll({
    where: { id: { [Op.in]: friendIds } },
    limit: Math.min(Number(limit) || 20, 50),
    order: [["fullName", "ASC"]]
  });
  return users.map((user) => toPublicUser(user, { includeEmail: false }));
}

async function listRequests(currentUserId, limit = 20) {
  const requests = await Friendship.findAll({
    where: {
      addresseeId: currentUserId,
      status: "pending"
    },
    include: [{ model: User, as: "requester" }],
    limit: Math.min(Number(limit) || 20, 50),
    order: [["createdAt", "DESC"]]
  });

  return requests.map((request) => ({
    id: request.id,
    status: request.status,
    requester: toPublicUser(request.requester, { includeEmail: false })
  }));
}

async function listSuggestions(currentUserId, limit = 20) {
  const relationships = await Friendship.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      status: { [Op.in]: ["pending", "accepted", "blocked"] }
    }
  });
  const excludedIds = new Set([currentUserId]);
  relationships.forEach((row) => {
    excludedIds.add(row.requesterId);
    excludedIds.add(row.addresseeId);
  });

  const users = await User.findAll({
    where: {
      id: { [Op.notIn]: [...excludedIds] }
    },
    limit: Math.min(Number(limit) || 20, 50),
    order: [["createdAt", "DESC"]]
  });

  return users.map((user) => toPublicUser(user, { includeEmail: false }));
}

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  unfriend,
  listFriends,
  listRequests,
  listSuggestions
};
