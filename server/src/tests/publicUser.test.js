const toPublicUser = require("../utils/publicUser");

describe("toPublicUser", () => {
  const user = {
    id: "user-1",
    username: "john",
    email: "john@example.com",
    fullName: "John Doe",
    avatar: "avatar-url",
    avatarPublicId: "avatar-public-id",
    coverPhoto: "cover-url",
    coverPhotoPublicId: "cover-public-id",
    bio: "Hello",
    isVerified: true,
    password: "secret",
    refreshTokenHash: "token"
  };

  it("hides email and public ids for non-owner views", () => {
    const result = toPublicUser(user, { includeEmail: false });

    expect(result.email).toBeUndefined();
    expect(result.avatarPublicId).toBeUndefined();
    expect(result.password).toBeUndefined();
    expect(result.refreshTokenHash).toBeUndefined();
  });

  it("can include owner-only fields", () => {
    const result = toPublicUser(user, { includeEmail: true, includePublicIds: true });

    expect(result.email).toBe(user.email);
    expect(result.avatarPublicId).toBe(user.avatarPublicId);
    expect(result.coverPhotoPublicId).toBe(user.coverPhotoPublicId);
  });
});
