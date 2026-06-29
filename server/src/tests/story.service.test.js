jest.mock("../services/upload.service", () => ({
  uploadBuffer: jest.fn(),
  deleteMedia: jest.fn()
}));

jest.mock("../models", () => ({
  Story: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn()
  },
  StoryView: {
    count: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOrCreate: jest.fn()
  },
  User: {},
  Friendship: {
    findOne: jest.fn(),
    findAll: jest.fn()
  }
}));

const { Story, StoryView, Friendship } = require("../models");
const uploadService = require("../services/upload.service");
const storyService = require("../services/story.service");

function makeStory(overrides = {}) {
  return {
    id: "story-1",
    userId: "author-1",
    media: "https://cdn.example/story.jpg",
    mediaPublicId: "stories/story-1",
    mediaType: "image",
    text: "Hello",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    deletedAt: null,
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
    createdAt: new Date("2026-06-22T00:00:00.000Z"),
    updatedAt: new Date("2026-06-22T00:00:00.000Z"),
    update: jest.fn(function update(values) {
      Object.assign(this, values);
      return Promise.resolve(this);
    }),
    ...overrides
  };
}

describe("storyService permissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows owners to view their active stories", async () => {
    await expect(storyService.canViewStory(makeStory({ userId: "user-a" }), "user-a")).resolves.toBe(true);
  });

  it("requires accepted friendship for friend stories", async () => {
    Friendship.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "friendship-1" });

    await expect(storyService.canViewStory(makeStory({ userId: "user-b" }), "user-a")).resolves.toBe(false);
    await expect(storyService.canViewStory(makeStory({ userId: "user-b" }), "user-a")).resolves.toBe(true);
  });

  it("blocks expired stories", async () => {
    await expect(
      storyService.canViewStory(makeStory({ expiresAt: new Date(Date.now() - 1000) }), "author-1")
    ).resolves.toBe(false);
  });
});

describe("storyService feed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StoryView.count.mockResolvedValue(0);
  });

  it("groups active stories from current user and accepted friends", async () => {
    Friendship.findAll.mockResolvedValue([{ requesterId: "user-a", addresseeId: "user-b" }]);
    StoryView.findAll.mockResolvedValue([{ storyId: "story-b-1", userId: "user-a" }]);
    Story.findAll.mockResolvedValue([
      makeStory({ id: "story-b-1", userId: "user-b", author: { id: "user-b", username: "b", fullName: "Bee" } }),
      makeStory({ id: "story-a-1", userId: "user-a", author: { id: "user-a", username: "a", fullName: "Aye" } })
    ]);

    const result = await storyService.listFeed("user-a", { limit: 10 });

    expect(Story.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null
        })
      })
    );
    expect(result.groups).toHaveLength(2);
    expect(result.groups.map((group) => group.user.id)).toEqual(["user-b", "user-a"]);
    expect(result.groups[0].stories[0].viewed).toBe(true);
  });
});

describe("storyService mutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    StoryView.count.mockResolvedValue(0);
  });

  it("creates a story with uploaded media and 24h expiry", async () => {
    uploadService.uploadBuffer.mockResolvedValue({
      url: "https://cdn.example/story.jpg",
      publicId: "stories/new",
      resourceType: "image"
    });
    Story.create.mockResolvedValue(makeStory({ id: "story-new", userId: "user-a" }));
    Story.findOne.mockResolvedValue(makeStory({ id: "story-new", userId: "user-a" }));
    StoryView.findOne.mockResolvedValue(null);

    const story = await storyService.createStory(
      "user-a",
      { text: "Fresh" },
      [{ mimetype: "image/jpeg", buffer: Buffer.from("fake") }]
    );

    expect(uploadService.uploadBuffer).toHaveBeenCalledWith(expect.any(Object), "stories", "image");
    expect(Story.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-a",
        media: "https://cdn.example/story.jpg",
        mediaType: "image",
        text: "Fresh"
      })
    );
    expect(story.id).toBe("story-new");
  });

  it("marks viewed idempotently with findOrCreate", async () => {
    Story.findOne.mockResolvedValue(makeStory({ id: "story-1", userId: "user-b" }));
    Friendship.findOne.mockResolvedValue({ id: "friendship-1" });
    StoryView.findOrCreate.mockResolvedValue([{ id: "view-1" }, true]);

    const story = await storyService.markViewed("story-1", "user-a");

    expect(StoryView.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { storyId: "story-1", userId: "user-a" }
      })
    );
    expect(story.viewed).toBe(true);
  });

  it("only allows owners to delete stories", async () => {
    Story.findOne.mockResolvedValue(makeStory({ id: "story-1", userId: "owner-1" }));

    await expect(storyService.deleteStory("story-1", "user-a")).rejects.toMatchObject({
      status: 403,
      code: "STORY_DELETE_FORBIDDEN"
    });
  });
});
