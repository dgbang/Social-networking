import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/axios.js";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function createChatSocket(accessToken) {
  if (!accessToken) return null;
  return io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true
  });
}

export function emitChatEvent(socket, eventName, payload, timeoutMs = 7000) {
  if (!socket?.connected) {
    return Promise.reject(new Error("Socket is not connected"));
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Socket request timed out"));
    }, timeoutMs);

    socket.emit(eventName, payload, (response = {}) => {
      window.clearTimeout(timeout);
      if (response.ok) {
        resolve(response);
        return;
      }
      reject(new Error(response.error?.message || "Socket request failed"));
    });
  });
}
