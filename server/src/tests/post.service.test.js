jest.mock("../services/upload.service", () => ({
  uploadBuffer: jest.fn(),
  deleteMedia: jest.fn()
}));

jest.mock("../models", () => ({
  sequelize: {
    transaction: jest.fn((callback) => callback({ LOCK: { UPDATE: "UPDATE" } }))
  },
  Post: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn()
  },
  User: {},
  Friendship: {
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  Like: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

const { Post, Friendship, Like } = require("../models");
const postService = require("../services/post.service");

function makePost(overrides = {}) {
  return {
    id: "post-1",
    userId: "author-1",
    content: "Hello",
    media: [],
    privacy: "public",
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isDeleted: false,
    author: {
      id: "author-1",
      username: "author",
      fullName: "Author One",
      avatar: null,
      coverPhoto: null,
      bio: null,
      isVerified: false,
      createdAt: new Date("2026-06-15T00:00:00.000Z")
    },
    createdAt: new Date("2026-06-15T00:00:00.000Z"),
    updatedAt: new Date("2026-06-15T00:00:00.000Z"),
    ...overrides
  };
}

describe("postService privacy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows owners to view private posts", async () => {
    await expect(
      postService.canViewPost(makePost({ userId: "user-a", privacy: "private" }), "user-a")
    ).resolves.toBe(true);
  });

  it("requires accepted friendship for friends posts", async () => {
    Friendship.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "friendship-1" });

    await expect(
      postService.canViewPost(makePost({ userId: "user-b", privacy: "friends" }), "user-a")
    ).resolves.toBe(false);
    await expect(
      postService.canViewPost(makePost({ userId: "user-b", privacy: "friends" }), "user-a")
    ).resolves.toBe(true);
  });

  it("builds feed from public, own and accepted friend posts", async () => {
    Friendship.findAll.mockResolvedValue([{ requesterId: "user-a", addresseeId: "user-b" }]);
    Like.findOne.mockResolvedValue(null);
    Post.findAll.mockResolvedValue([
      makePost({ id: "post-public", privacy: "public", userId: "user-c" }),
      makePost({ id: "post-friend", privacy: "friends", userId: "user-b" })
    ]);

    const result = await postService.listFeed("user-a", { limit: 10 });

    expect(Post.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isDeleted: false
        }),
        limit: 11
      })
    );
    expect(result.posts.map((post) => post.id)).toEqual(["post-public", "post-friend"]);
  });
});

describe("postService.toggleReaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Like.findOne.mockResolvedValue(null);
  });

  it("creates first reaction and increments likesCount", async () => {
    const visiblePost = makePost({ id: "post-1", privacy: "public" });
    const lockedPost = {
      ...visiblePost,
      increment: jest.fn(function increment() {
        this.likesCount += 1;
        return Promise.resolve();
      }),
      reload: jest.fn(() => Promise.resolve())
    };
    Post.findOne.mockResolvedValueOnce(visiblePost).mockResolvedValueOnce(lockedPost);
    Like.create.mockResolvedValue({ id: "like-1" });

    const result = await postService.toggleReaction("post-1", "user-a", "love");

    expect(Like.create).toHaveBeenCalledWith(
      { postId: "post-1", userId: "user-a", type: "love" },
      expect.any(Object)
    );
    expect(lockedPost.increment).toHaveBeenCalledWith("likesCount", expect.any(Object));
    expect(result).toEqual({ reaction: { type: "love" }, likesCount: 1 });
  });

  it("updates reaction type without incrementing likesCount", async () => {
    const visiblePost = makePost({ id: "post-1", privacy: "public", likesCount: 1 });
    const lockedPost = { ...visiblePost, increment: jest.fn(), decrement: jest.fn(), reload: jest.fn() };
    const existing = { type: "like", update: jest.fn(), destroy: jest.fn() };
    Post.findOne.mockResolvedValueOnce(visiblePost).mockResolvedValueOnce(lockedPost);
    Like.findOne.mockResolvedValue(existing);

    const result = await postService.toggleReaction("post-1", "user-a", "haha");

    expect(existing.update).toHaveBeenCalledWith({ type: "haha" }, expect.any(Object));
    expect(lockedPost.increment).not.toHaveBeenCalled();
    expect(result).toEqual({ reaction: { type: "haha" }, likesCount: 1 });
  });
});
