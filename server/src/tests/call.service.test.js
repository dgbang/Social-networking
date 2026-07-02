jest.mock("../models", () => ({
  sequelize: {
    transaction: jest.fn((callback) => callback({}))
  },
  Conversation: {
    update: jest.fn()
  },
  ConversationMember: {
    findOne: jest.fn()
  },
  Message: {
    create: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Friendship: {
    findOne: jest.fn()
  }
}));

jest.mock("../socket/onlineUsers", () => ({
  isOnline: jest.fn()
}));

const { Conversation, ConversationMember, Message, User } = require("../models");
const onlineUsers = require("../socket/onlineUsers");
const callState = require("../socket/callState");
const callService = require("../services/call.service");

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const USER_C = "33333333-3333-4333-8333-333333333333";
const CONV_AB = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

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

function mockMember(userId) {
  ConversationMember.findOne.mockImplementation(({ where }) =>
    Promise.resolve([USER_A, USER_B].includes(where.userId) ? { id: `member-${userId}`, ...where } : null)
  );
}

describe("callService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    callState.reset();
    User.findByPk.mockImplementation((id) => Promise.resolve(makeUser(id)));
    onlineUsers.isOnline.mockReturnValue(true);
    mockMember();
    Message.create.mockResolvedValue({
      id: "message-call-1",
      conversationId: CONV_AB,
      senderId: USER_A,
      content: "Call ended",
      type: "call",
      media: { status: "ended" },
      createdAt: new Date("2026-06-22T00:00:00.000Z")
    });
    Conversation.update.mockResolvedValue([1]);
  });

  it("rejects calls to offline receivers", async () => {
    onlineUsers.isOnline.mockReturnValue(false);

    await expect(callService.startCall(USER_A, { receiverId: USER_B, conversationId: CONV_AB })).rejects.toMatchObject({
      status: 409,
      code: "CALL_RECEIVER_OFFLINE"
    });
  });

  it("starts a pending call and blocks busy users", async () => {
    const call = await callService.startCall(USER_A, { receiverId: USER_B, conversationId: CONV_AB });

    expect(call.status).toBe("pending");
    expect(call.callerId).toBe(USER_A);
    await expect(callService.startCall(USER_C, { receiverId: USER_A })).rejects.toMatchObject({
      status: 409,
      code: "CALL_BUSY"
    });
  });

  it("lets the receiver answer a pending call", async () => {
    const call = await callService.startCall(USER_A, { receiverId: USER_B, conversationId: CONV_AB });
    const answered = callService.answerCall(USER_B, call.id);

    expect(answered.status).toBe("active");
    expect(answered.startedAt).toBeTruthy();
  });

  it("blocks signaling from users outside the call", async () => {
    const call = await callService.startCall(USER_A, { receiverId: USER_B, conversationId: CONV_AB });
    callService.answerCall(USER_B, call.id);

    expect(() => callService.relaySignal(USER_C, call.id, { type: "offer" })).toThrow("You are not part of this call");
  });

  it("ends a call and writes a call log", async () => {
    const call = await callService.startCall(USER_A, { receiverId: USER_B, conversationId: CONV_AB });
    callService.answerCall(USER_B, call.id);

    const result = await callService.endCall(USER_A, call.id);

    expect(result.reason).toBe("ended");
    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: CONV_AB,
        senderId: USER_A,
        type: "call"
      }),
      expect.any(Object)
    );
  });
});
