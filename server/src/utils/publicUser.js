function toPublicUser(user, { includeEmail = true, includePublicIds = false } = {}) {
  if (!user) return null;
  const publicUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar,
    coverPhoto: user.coverPhoto,
    bio: user.bio,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };

  if (includeEmail) {
    publicUser.email = user.email;
  }

  if (includePublicIds) {
    publicUser.avatarPublicId = user.avatarPublicId;
    publicUser.coverPhotoPublicId = user.coverPhotoPublicId;
  }

  return publicUser;
}

module.exports = toPublicUser;
