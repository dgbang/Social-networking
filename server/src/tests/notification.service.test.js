jest.mock("../models", () => ({
  Notification: {
    count: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  },
  User: {}
}));

const { Notification } = require("../models");
const notificationService = require("../services/notification.service");

function makeNotification(overrides = {}) {
  return {
    id: "notification-1",
    userId: "user-a",
    fromUserId: "user-b",
    type: "like",
    referenceId: "post-1",
    content: "reacted like to your post",
    isRead: false,
    fromUser: {
      id: "user-b",
      username: "bee",
      fullName: "Bee",
      avatar: null,
      coverPhoto: null,
      bio: null,
      isVerified: false,
      createdAt: new Date("2026-07-01T00:00:00.000Z")
    },
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    update: jest.fn(function update(values) {
      Object.assign(this, values);
      return Promise.resolve(this);
    }),
    ...overrides
  };
}

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.setSocketServer(null);
    Notification.count.mockResolvedValue(0);
  });

  it("skips self notifications", async () => {
    const result = await notificationService.createNotification({
      userId: "user-a",
      fromUserId: "user-a",
      type: "like",
      referenceId: "post-1",
      content: "reacted to your post"
    });

    expect(result).toBeNull();
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("creates and serializes a notification", async () => {
    Notification.create.mockResolvedValue({ id: "notification-1" });
    Notification.findByPk.mockResolvedValue(makeNotification());

    const result = await notificationService.createNotification({
      userId: "user-a",
      fromUserId: "user-b",
      type: "like",
      referenceId: "post-1",
      content: "reacted like to your post"
    });

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-a",
        fromUserId: "user-b",
        type: "like",
        referenceId: "post-1",
        isRead: false
      }),
      expect.any(Object)
    );
    expect(result).toMatchObject({
      id: "notification-1",
      type: "like",
      fromUser: { id: "user-b", fullName: "Bee" }
    });
  });

  it("lists unread notifications with unread count", async () => {
    Notification.findAll.mockResolvedValue([makeNotification()]);
    Notification.count.mockResolvedValue(3);

    const result = await notificationService.listNotifications("user-a", { status: "unread", limit: 10 });

    expect(Notification.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-a", isRead: false }),
        limit: 11
      })
    );
    expect(result.notifications).toHaveLength(1);
    expect(result.unreadCount).toBe(3);
  });

  it("marks a notification as read idempotently", async () => {
    const notification = makeNotification();
    Notification.findOne.mockResolvedValue(notification);
    Notification.count.mockResolvedValue(2);

    const result = await notificationService.markRead("user-a", "notification-1");

    expect(Notification.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "notification-1", userId: "user-a" } }));
    expect(notification.update).toHaveBeenCalledWith({ isRead: true });
    expect(result.notification.isRead).toBe(true);
    expect(result.unreadCount).toBe(2);
  });
});
