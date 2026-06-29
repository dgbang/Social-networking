const userSockets = new Map();

function addUserSocket(userId, socketId) {
  const key = String(userId);
  const sockets = userSockets.get(key) || new Set();
  sockets.add(socketId);
  userSockets.set(key, sockets);
  return sockets.size === 1;
}

function removeUserSocket(userId, socketId) {
  const key = String(userId);
  const sockets = userSockets.get(key);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(key);
    return true;
  }
  return false;
}

function isOnline(userId) {
  return userSockets.has(String(userId));
}

function listOnlineUserIds() {
  return Array.from(userSockets.keys());
}

module.exports = {
  addUserSocket,
  removeUserSocket,
  isOnline,
  listOnlineUserIds
};
