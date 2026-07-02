const { validate: validateUuid } = require("uuid");
const { sequelize, Conversation, ConversationMember, Message, User } = require("../models");
const toPublicUser = require("../utils/publicUser");
const chatService = require("./chat.service");
const onlineUsers = require("../socket/onlineUsers");
const callState = require("../socket/callState");

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function assertUuid(value, code, message) {
  if (!value || !validateUuid(String(value))) {
    throw createError(400, code, message);
  }
}

function serializeCall(call) {
  if (!call) return null;
  return {
    id: call.id,
    callerId: call.callerId,
    receiverId: call.receiverId,
    conversationId: call.conversationId,
    status: call.status,
    caller: call.caller,
    receiver: call.receiver,
    media: call.media,
    createdAt: call.createdAt,
    startedAt: call.startedAt,
    endedAt: call.endedAt
  };
}

function isParticipant(call, userId) {
  return String(call?.callerId) === String(userId) || String(call?.receiverId) === String(userId);
}

async function ensureConversationParticipants(conversationId, callerId, receiverId) {
  if (!conversationId) return;
  assertUuid(conversationId, "CALL_CONVERSATION_INVALID", "Valid conversation id is required");
  await chatService.ensureMember(conversationId, callerId);
  await chatService.ensureMember(conversationId, receiverId);
}

async function startCall(callerId, payload = {}) {
  const receiverId = payload.receiverId;
  assertUuid(receiverId, "CALL_RECEIVER_REQUIRED", "Valid receiver id is required");
  if (String(receiverId) === String(callerId)) {
    throw createError(400, "CALL_RECEIVER_INVALID", "Cannot call yourself");
  }

  const receiver = await User.findByPk(receiverId);
  if (!receiver) {
    throw createError(404, "CALL_RECEIVER_NOT_FOUND", "Receiver not found");
  }
  if (!onlineUsers.isOnline(receiverId)) {
    throw createError(409, "CALL_RECEIVER_OFFLINE", "Receiver is offline");
  }
  if (callState.isUserBusy(callerId) || callState.isUserBusy(receiverId)) {
    throw createError(409, "CALL_BUSY", "User is busy");
  }

  await ensureConversationParticipants(payload.conversationId, callerId, receiverId);

  const caller = await User.findByPk(callerId);
  const call = callState.createCall({
    callerId,
    receiverId,
    conversationId: payload.conversationId || null,
    caller: toPublicUser(caller, { includeEmail: false }),
    receiver: toPublicUser(receiver, { includeEmail: false })
  });
  return serializeCall(call);
}

function getParticipantCall(callId, userId) {
  assertUuid(callId, "CALL_ID_REQUIRED", "Valid call id is required");
  const call = callState.getCall(callId);
  if (!call) {
    throw createError(404, "CALL_NOT_FOUND", "Call not found");
  }
  if (!isParticipant(call, userId)) {
    throw createError(403, "CALL_FORBIDDEN", "You are not part of this call");
  }
  return call;
}

function answerCall(userId, callId) {
  const call = getParticipantCall(callId, userId);
  if (String(call.receiverId) !== String(userId)) {
    throw createError(403, "CALL_FORBIDDEN", "Only receiver can answer this call");
  }
  if (call.status !== "pending") {
    throw createError(409, "CALL_INVALID_STATE", "Call is not pending");
  }
  return serializeCall(callState.setActive(call.id));
}

async function writeCallLog(call, status) {
  if (!call?.conversationId) return null;
  const endedAt = call.endedAt || new Date();
  const startedAt = call.startedAt || call.createdAt;
  const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));
  const contentByStatus = {
    ended: "Call ended",
    rejected: "Call rejected",
    missed: "Missed call",
    canceled: "Call canceled",
    disconnected: "Call disconnected"
  };

  const message = await sequelize.transaction(async (transaction) => {
    const row = await Message.create(
      {
        conversationId: call.conversationId,
        senderId: call.callerId,
        content: contentByStatus[status] || "Call ended",
        media: {
          callId: call.id,
          status,
          startedAt,
          endedAt,
          durationSeconds
        },
        type: "call"
      },
      { transaction }
    );
    await Conversation.update({ lastMessageAt: endedAt }, { where: { id: call.conversationId }, transaction });
    return row;
  });

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    media: message.media,
    createdAt: message.createdAt
  };
}

async function rejectCall(userId, callId) {
  const call = getParticipantCall(callId, userId);
  if (String(call.receiverId) !== String(userId)) {
    throw createError(403, "CALL_FORBIDDEN", "Only receiver can reject this call");
  }
  const ended = callState.removeCall(call.id);
  const callLog = await writeCallLog(ended, "rejected");
  return { call: serializeCall(ended), callLog, reason: "rejected" };
}

async function endCall(userId, callId, reason = "ended") {
  const call = getParticipantCall(callId, userId);
  const status = call.status === "pending" && String(call.callerId) === String(userId) ? "canceled" : reason;
  const ended = callState.removeCall(call.id);
  const callLog = await writeCallLog(ended, status);
  return { call: serializeCall(ended), callLog, reason: status };
}

async function timeoutCall(callId) {
  const call = callState.getCall(callId);
  if (!call || call.status !== "pending") return null;
  const ended = callState.removeCall(call.id);
  const callLog = await writeCallLog(ended, "missed");
  return { call: serializeCall(ended), callLog, reason: "timeout" };
}

async function endCallsForUser(userId, reason = "disconnected") {
  const call = callState.getCallForUser(userId);
  if (!call) return [];
  const ended = callState.removeCall(call.id);
  const callLog = await writeCallLog(ended, reason);
  return [{ call: serializeCall(ended), callLog, reason }];
}

function toggleMedia(userId, callId, mediaState = {}) {
  const call = getParticipantCall(callId, userId);
  const updated = callState.updateMedia(call.id, userId, mediaState);
  return {
    call: serializeCall(updated),
    targetUserId: callState.otherParticipant(updated, userId),
    userId,
    audioEnabled: Boolean(mediaState.audioEnabled),
    videoEnabled: Boolean(mediaState.videoEnabled)
  };
}

function relaySignal(userId, callId, signal) {
  const call = getParticipantCall(callId, userId);
  if (call.status !== "active") {
    throw createError(409, "CALL_INVALID_STATE", "Call is not active");
  }
  return {
    call: serializeCall(call),
    targetUserId: callState.otherParticipant(call, userId),
    fromUserId: userId,
    signal
  };
}

module.exports = {
  serializeCall,
  startCall,
  answerCall,
  rejectCall,
  endCall,
  timeoutCall,
  endCallsForUser,
  toggleMedia,
  relaySignal,
  writeCallLog
};
