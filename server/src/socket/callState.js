const { v4: uuidv4 } = require("uuid");

const calls = new Map();
const userCalls = new Map();

function indexUser(userId, callId) {
  userCalls.set(String(userId), callId);
}

function unindexUser(userId) {
  userCalls.delete(String(userId));
}

function isUserBusy(userId) {
  return userCalls.has(String(userId));
}

function createCall({ callerId, receiverId, conversationId, caller, receiver }) {
  const now = new Date();
  const call = {
    id: uuidv4(),
    callerId,
    receiverId,
    conversationId: conversationId || null,
    caller,
    receiver,
    status: "pending",
    createdAt: now,
    startedAt: null,
    endedAt: null,
    timer: null,
    media: {
      [callerId]: { audioEnabled: true, videoEnabled: true },
      [receiverId]: { audioEnabled: true, videoEnabled: true }
    }
  };
  calls.set(call.id, call);
  indexUser(callerId, call.id);
  indexUser(receiverId, call.id);
  return call;
}

function getCall(callId) {
  return calls.get(String(callId));
}

function getCallForUser(userId) {
  const callId = userCalls.get(String(userId));
  return callId ? getCall(callId) : null;
}

function setTimer(callId, timer) {
  const call = getCall(callId);
  if (call) call.timer = timer;
}

function clearTimer(call) {
  if (call?.timer) {
    clearTimeout(call.timer);
    call.timer = null;
  }
}

function setActive(callId) {
  const call = getCall(callId);
  if (!call) return null;
  call.status = "active";
  call.startedAt = new Date();
  clearTimer(call);
  return call;
}

function updateMedia(callId, userId, mediaState) {
  const call = getCall(callId);
  if (!call) return null;
  call.media[String(userId)] = {
    audioEnabled: Boolean(mediaState.audioEnabled),
    videoEnabled: Boolean(mediaState.videoEnabled)
  };
  return call;
}

function removeCall(callId) {
  const call = getCall(callId);
  if (!call) return null;
  clearTimer(call);
  call.endedAt = new Date();
  calls.delete(call.id);
  unindexUser(call.callerId);
  unindexUser(call.receiverId);
  return call;
}

function otherParticipant(call, userId) {
  if (!call) return null;
  if (String(call.callerId) === String(userId)) return call.receiverId;
  if (String(call.receiverId) === String(userId)) return call.callerId;
  return null;
}

function reset() {
  for (const call of calls.values()) {
    clearTimer(call);
  }
  calls.clear();
  userCalls.clear();
}

module.exports = {
  createCall,
  getCall,
  getCallForUser,
  isUserBusy,
  setTimer,
  setActive,
  updateMedia,
  removeCall,
  otherParticipant,
  reset
};
