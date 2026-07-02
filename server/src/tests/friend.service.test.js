jest.mock("../models", () => ({
  Friendship: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  }
}));
jest.mock("../services/chat.service", () => ({
  createConversation: jest.fn()
}));

const { Friendship, User } = require("../models");
const chatService = require("../services/chat.service");
const friendService = require("../services/friend.service");

describe("friendService.sendRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: "target-user" });
  });

  it("rejects self friend request", async () => {
    await expect(friendService.sendRequest("same-user", "same-user")).rejects.toMatchObject({
      status: 400,
      code: "FRIEND_REQUEST_SELF"
    });
    expect(Friendship.create).not.toHaveBeenCalled();
  });

  it("does not create duplicate pending relationship", async () => {
    Friendship.findOne.mockResolvedValue({ status: "pending" });

    await expect(friendService.sendRequest("user-a", "user-b")).rejects.toMatchObject({
      status: 409,
      code: "FRIEND_REQUEST_EXISTS"
    });
    expect(Friendship.create).not.toHaveBeenCalled();
  });

  it("reopens a rejected relationship instead of creating a duplicate", async () => {
    const update = jest.fn();
    Friendship.findOne.mockResolvedValue({ status: "rejected", update });

    await friendService.sendRequest("user-a", "user-b");

    expect(update).toHaveBeenCalledWith({
      requesterId: "user-a",
      addresseeId: "user-b",
      status: "pending"
    });
    expect(Friendship.create).not.toHaveBeenCalled();
  });
});

describe("friendService.acceptRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts the request and creates or reuses a private conversation", async () => {
    const friendship = {
      update: jest.fn().mockResolvedValue(undefined)
    };
    const conversation = { id: "conversation-ab", type: "private" };
    Friendship.findOne.mockResolvedValue(friendship);
    chatService.createConversation.mockResolvedValue(conversation);

    const result = await friendService.acceptRequest("user-b", "user-a");

    expect(friendship.update).toHaveBeenCalledWith({ status: "accepted" });
    expect(chatService.createConversation).toHaveBeenCalledWith("user-b", {
      type: "private",
      memberIds: ["user-a"]
    });
    expect(result).toEqual({ friendship, conversation });
  });
});
