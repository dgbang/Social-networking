const callService = require("../services/call.service");
const callState = require("./callState");

const CALL_TIMEOUT_MS = 30000;

function emitCallError(socket, error) {
  socket.emit("call_error", {
    code: error.code || "CALL_ERROR",
    message: error.message || "Call error"
  });
}

function emitToParticipants(io, call, eventName, payload) {
  if (!call) return;
  io.to([`user:${call.callerId}`, `user:${call.receiverId}`]).emit(eventName, payload);
}

function registerCallHandlers(io, socket) {
  const user = socket.data.user;

  socket.on("call_user", async (payload = {}, ack) => {
    try {
      const call = await callService.startCall(user.id, payload);
      const timer = setTimeout(async () => {
        const result = await callService.timeoutCall(call.id);
        if (result) {
          emitToParticipants(io, result.call, "call_ended", result);
        }
      }, CALL_TIMEOUT_MS);
      callState.setTimer(call.id, timer);
      io.to(`user:${call.receiverId}`).emit("incoming_call", { call });
      if (typeof ack === "function") ack({ ok: true, call });
    } catch (error) {
      emitCallError(socket, error);
      if (typeof ack === "function") ack({ ok: false, error: { code: error.code, message: error.message } });
    }
  });

  socket.on("answer_call", async (payload = {}, ack) => {
    try {
      const call = callService.answerCall(user.id, payload.callId);
      emitToParticipants(io, call, "call_answered", { call });
      if (typeof ack === "function") ack({ ok: true, call });
    } catch (error) {
      emitCallError(socket, error);
      if (typeof ack === "function") ack({ ok: false, error: { code: error.code, message: error.message } });
    }
  });

  socket.on("reject_call", async (payload = {}, ack) => {
    try {
      const result = await callService.rejectCall(user.id, payload.callId);
      emitToParticipants(io, result.call, "call_rejected", result);
      if (typeof ack === "function") ack({ ok: true, ...result });
    } catch (error) {
      emitCallError(socket, error);
      if (typeof ack === "function") ack({ ok: false, error: { code: error.code, message: error.message } });
    }
  });

  socket.on("end_call", async (payload = {}, ack) => {
    try {
      const result = await callService.endCall(user.id, payload.callId);
      emitToParticipants(io, result.call, "call_ended", result);
      if (typeof ack === "function") ack({ ok: true, ...result });
    } catch (error) {
      emitCallError(socket, error);
      if (typeof ack === "function") ack({ ok: false, error: { code: error.code, message: error.message } });
    }
  });

  socket.on("toggle_media", (payload = {}) => {
    try {
      const result = callService.toggleMedia(user.id, payload.callId, payload);
      io.to(`user:${result.targetUserId}`).emit("media_toggled", {
        callId: payload.callId,
        userId: user.id,
        audioEnabled: result.audioEnabled,
        videoEnabled: result.videoEnabled
      });
    } catch (error) {
      emitCallError(socket, error);
    }
  });

  ["webrtc_offer", "webrtc_answer", "webrtc_ice_candidate"].forEach((eventName) => {
    socket.on(eventName, (payload = {}) => {
      try {
        const signalKey = eventName === "webrtc_ice_candidate" ? "candidate" : eventName.replace("webrtc_", "");
        const result = callService.relaySignal(user.id, payload.callId, payload[signalKey]);
        io.to(`user:${result.targetUserId}`).emit(eventName, {
          callId: payload.callId,
          fromUserId: user.id,
          [signalKey]: result.signal
        });
      } catch (error) {
        emitCallError(socket, error);
      }
    });
  });
}

async function handleCallDisconnect(io, userId) {
  const results = await callService.endCallsForUser(userId, "disconnected");
  results.forEach((result) => {
    emitToParticipants(io, result.call, "call_ended", result);
  });
}

module.exports = {
  registerCallHandlers,
  handleCallDisconnect
};
