const { Server } = require("socket.io");
const { Op } = require("sequelize");
const env = require("../config/env");
const { User, Friendship } = require("../models");
const { verifyAccessToken } = require("../utils/tokens");
const toPublicUser = require("../utils/publicUser");
const chatService = require("../services/chat.service");
const onlineUsers = require("./onlineUsers");

function socketError(socket, error) {
  socket.emit("socket_error", {
    code: error.code || "SOCKET_ERROR",
    message: error.message || "Socket error"
  });
}

async function getFriendIds(userId) {
  const rows = await Friendship.findAll({
    where: {
      status: "accepted",
      [Op.or]: [{ requesterId: userId }, { addresseeId: userId }]
    }
  });
  return rows.map((row) => (row.requesterId === userId ? row.addresseeId : row.requesterId));
}

async function emitToFriends(io, userId, eventName) {
  const friendIds = await getFriendIds(userId);
  friendIds.forEach((friendId) => {
    io.to(`user:${friendId}`).emit(eventName, { userId });
  });
}

async function emitConversationMessage(io, conversationId, eventName, message) {
  const memberIds = await chatService.getConversationMemberIds(conversationId);
  io.to(`conversation:${conversationId}`).emit(eventName, { conversationId, message });
  memberIds.forEach((memberId) => {
    io.to(`user:${memberId}`).emit(eventName, { conversationId, message });
  });
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        const error = new Error("Missing socket token");
        error.code = "UNAUTHORIZED";
        return next(error);
      }
      const payload = verifyAccessToken(token);
      const user = await User.findByPk(payload.sub);
      if (!user) {
        const error = new Error("Invalid socket token");
        error.code = "UNAUTHORIZED";
        return next(error);
      }
      socket.data.user = user;
      return next();
    } catch (error) {
      error.code = "UNAUTHORIZED";
      return next(error);
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user;
    socket.join(`user:${user.id}`);
    const becameOnline = onlineUsers.addUserSocket(user.id, socket.id);
    if (becameOnline) {
      emitToFriends(io, user.id, "user_online").catch(() => {});
    }

    socket.emit("online_users_list", { userIds: onlineUsers.listOnlineUserIds() });

    socket.on("join_conversation", async (payload = {}) => {
      try {
        await chatService.ensureMember(payload.conversationId, user.id);
        socket.join(`conversation:${payload.conversationId}`);
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("send_message", async (payload = {}) => {
      try {
        const message = await chatService.createMessage(user.id, payload);
        await emitConversationMessage(io, message.conversationId, "new_message", message);
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("reply_message", async (payload = {}) => {
      try {
        const message = await chatService.createMessage(user.id, payload);
        await emitConversationMessage(io, message.conversationId, "new_reply", message);
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("delete_message", async (payload = {}) => {
      try {
        const message = await chatService.deleteMessage(user.id, payload.messageId);
        io.to(`conversation:${message.conversationId}`).emit("message_deleted", {
          conversationId: message.conversationId,
          messageId: message.id,
          message
        });
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("typing", async (payload = {}) => {
      try {
        await chatService.ensureMember(payload.conversationId, user.id);
        socket.to(`conversation:${payload.conversationId}`).emit("user_typing", {
          conversationId: payload.conversationId,
          user: toPublicUser(user, { includeEmail: false })
        });
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("stop_typing", async (payload = {}) => {
      try {
        await chatService.ensureMember(payload.conversationId, user.id);
        socket.to(`conversation:${payload.conversationId}`).emit("user_stop_typing", {
          conversationId: payload.conversationId,
          user: toPublicUser(user, { includeEmail: false })
        });
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("mark_read", async (payload = {}) => {
      try {
        const result = await chatService.markRead(user.id, payload.conversationId);
        io.to(`conversation:${payload.conversationId}`).emit("message_read", result);
      } catch (error) {
        socketError(socket, error);
      }
    });

    socket.on("disconnect", () => {
      const becameOffline = onlineUsers.removeUserSocket(user.id, socket.id);
      if (becameOffline) {
        emitToFriends(io, user.id, "user_offline").catch(() => {});
      }
    });
  });

  return io;
}

module.exports = {
  setupSocket
};
