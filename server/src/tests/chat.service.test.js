jest.mock("../models", () => ({
  sequelize: {
    transaction: jest.fn((callback) => callback({})),
    literal: jest.fn((value) => value)
  },
  Conversation: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn()
  },
  ConversationMember: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  },
  Message: {
    count: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  User: {},
  Friendship: {
    findOne: jest.fn()
  }
}));

const { Conversation, ConversationMember, Message, Friendship } = require("../models");
const chatService = require("../services/chat.service");

function makeUser(id, name = id) {
  return {
    id,
    username: name,
    fullName: name,
    avatar: null,
    coverPhoto: null,
    bio: null,
    isVerified: false,
    createdAt: new Date("2026-06-22T00:00:00.000Z")
  };
}

function makeMember(userId, role = "member") {
  return {
    id: `member-${userId}`,
    conversationId: "conv-1",
    userId,
    role,
    joinedAt: new Date("2026-06-22T00:00:00.000Z"),
    lastReadAt: null,
    deletedAt: null,
    user: makeUser(userId)
  };
}

function makeConversation(overrides = {}) {
  return {
    id: "conv-1",
    type: "private",
    name: null,
    avatar: null,
    adminId: null,
    lastMessageAt: new Date("2026-06-22T00:00:00.000Z"),
    members: [makeMember("user-a"), makeMember("user-b")],
    createdAt: new Date("2026-06-22T00:00:00.000Z"),
    updatedAt: new Date("2026-06-22T00:00:00.000Z"),
    ...overrides
  };
}

function makeMessage(overrides = {}) {
  return {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-a",
    replyToId: null,
    content: "Hello",
    media: null,
    type: "text",
    isDeleted: false,
    deletedAt: null,
    sender: makeUser("user-a"),
    replyTo: null,
    createdAt: new Date("2026-06-22T00:00:00.000Z"),
    updatedAt: new Date("2026-06-22T00:00:00.000Z"),
    update: jest.fn(function update(values) {
      Object.assign(this, values);
      return Promise.resolve(this);
    }),
    ...overrides
  };
}

describe("chatService conversations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Friendship.findOne.mockResolvedValue({ id: "friendship-1" });
    Message.findOne.mockResolvedValue(null);
    Message.count.mockResolvedValue(0);
  });

  it("reuses an existing private conversation", async () => {
    Conversation.findAll.mockResolvedValue([makeConversation()]);

    const conversation = await chatService.createConversation("user-a", {
      type: "private",
      memberIds: ["user-b"]
    });

    expect(Conversation.create).not.toHaveBeenCalled();
    expect(conversation.id).toBe("conv-1");
    expect(conversation.type).toBe("private");
    expect(conversation.__created).toBe(false);
    expect(JSON.stringify(conversation)).not.toContain("__created");
  });

  it("creates a group conversation with creator as admin", async () => {
    Conversation.findAll.mockResolvedValue([]);
    Conversation.create.mockResolvedValue(makeConversation({ id: "group-1", type: "group", members: [] }));
    Conversation.findByPk.mockResolvedValue(
      makeConversation({
        id: "group-1",
        type: "group",
        name: "Team",
        adminId: "user-a",
        members: [makeMember("user-a", "admin"), makeMember("user-b"), makeMember("user-c")]
      })
    );

    const conversation = await chatService.createConversation("user-a", {
      type: "group",
      name: "Team",
      memberIds: ["user-b", "user-c"]
    });

    expect(ConversationMember.bulkCreate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ userId: "user-a", role: "admin" })]),
      expect.any(Object)
    );
    expect(conversation.type).toBe("group");
  });

  it("blocks private chat with non-friends", async () => {
    Friendship.findOne.mockResolvedValue(null);

    await expect(
      chatService.createConversation("user-a", { type: "private", memberIds: ["user-d"] })
    ).rejects.toMatchObject({
      status: 403,
      code: "CHAT_FRIEND_REQUIRED"
    });
  });
});

describe("chatService messages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ConversationMember.findOne.mockResolvedValue(makeMember("user-a"));
    Message.count.mockResolvedValue(0);
  });

  it("requires membership to list messages", async () => {
    ConversationMember.findOne.mockResolvedValue(null);

    await expect(chatService.listMessages("user-x", "conv-1")).rejects.toMatchObject({
      status: 403,
      code: "CONVERSATION_FORBIDDEN"
    });
  });

  it("creates a text message and updates read state", async () => {
    const created = makeMessage({ id: "msg-new" });
    Message.create.mockResolvedValue(created);
    Message.findByPk.mockResolvedValue(created);
    Conversation.update.mockResolvedValue([1]);
    ConversationMember.update.mockResolvedValue([1]);

    const message = await chatService.createMessage("user-a", {
      conversationId: "conv-1",
      content: " Hello "
    });

    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: "conv-1", senderId: "user-a", content: "Hello" }),
      expect.any(Object)
    );
    expect(Conversation.update).toHaveBeenCalled();
    expect(message.id).toBe("msg-new");
  });

  it("rejects text messages over 5000 characters", async () => {
    await expect(
      chatService.createMessage("user-a", {
        conversationId: "conv-1",
        content: "x".repeat(5001)
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "MESSAGE_CONTENT_TOO_LONG"
    });
  });

  it("only lets the sender delete a message", async () => {
    Message.findByPk.mockResolvedValue(makeMessage({ senderId: "user-b" }));

    await expect(chatService.deleteMessage("user-a", "msg-1")).rejects.toMatchObject({
      status: 403,
      code: "MESSAGE_DELETE_FORBIDDEN"
    });
  });

  it("updates lastReadAt when marking read", async () => {
    const member = {
      ...makeMember("user-a"),
      update: jest.fn(function update(values) {
        Object.assign(this, values);
        return Promise.resolve(this);
      })
    };
    ConversationMember.findOne.mockResolvedValue(member);

    const result = await chatService.markRead("user-a", "conv-1");

    expect(member.update).toHaveBeenCalledWith(expect.objectContaining({ lastReadAt: expect.any(Date) }));
    expect(result.conversationId).toBe("conv-1");
  });

  it("summarizes unread messages across conversations", async () => {
    ConversationMember.findAll.mockResolvedValue([
      { conversationId: "conv-1", lastReadAt: new Date("2026-06-22T01:00:00.000Z") },
      { conversationId: "conv-2", lastReadAt: null }
    ]);
    Message.count.mockResolvedValueOnce(2).mockResolvedValueOnce(0);

    const summary = await chatService.getUnreadSummary("user-a");

    expect(Message.count).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          conversationId: "conv-1",
          senderId: expect.any(Object),
          createdAt: expect.any(Object)
        })
      })
    );
    expect(summary).toEqual({ unreadCount: 2, unreadConversations: 1 });
  });
});
