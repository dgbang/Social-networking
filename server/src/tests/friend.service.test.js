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

  it("từ chối lời mời kết bạn gửi cho chính mình", async () => {
    await expect(friendService.sendRequest("same-user", "same-user")).rejects.toMatchObject({
      status: 400,
      code: "FRIEND_REQUEST_SELF"
    });
    expect(Friendship.create).not.toHaveBeenCalled();
  });

  it("không tạo trùng quan hệ đang chờ xử lý", async () => {
    Friendship.findOne.mockResolvedValue({ status: "pending" });

    await expect(friendService.sendRequest("user-a", "user-b")).rejects.toMatchObject({
      status: 409,
      code: "FRIEND_REQUEST_EXISTS"
    });
    expect(Friendship.create).not.toHaveBeenCalled();
  });

  it("mở lại quan hệ đã bị từ chối thay vì tạo bản ghi trùng", async () => {
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

describe("friendService.getRelationship", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue({ id: "user-b" });
  });

  it("trả về trạng thái chưa kết bạn khi hai người chưa có quan hệ", async () => {
    Friendship.findOne.mockResolvedValue(null);

    await expect(friendService.getRelationship("user-a", "user-b")).resolves.toEqual({
      status: "none",
      direction: null
    });
  });

  it("xác định đúng lời mời đang chờ do người hiện tại gửi", async () => {
    Friendship.findOne.mockResolvedValue({
      id: "friendship-ab",
      requesterId: "user-a",
      addresseeId: "user-b",
      status: "pending"
    });

    await expect(friendService.getRelationship("user-a", "user-b")).resolves.toEqual({
      id: "friendship-ab",
      status: "pending",
      direction: "outgoing"
    });
  });

  it("xác định đúng lời mời đang chờ do người kia gửi", async () => {
    Friendship.findOne.mockResolvedValue({
      id: "friendship-ba",
      requesterId: "user-b",
      addresseeId: "user-a",
      status: "pending"
    });

    await expect(friendService.getRelationship("user-a", "user-b")).resolves.toEqual({
      id: "friendship-ba",
      status: "pending",
      direction: "incoming"
    });
  });
});

describe("friendService.acceptRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("chấp nhận lời mời và tạo hoặc tái sử dụng cuộc trò chuyện riêng", async () => {
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
