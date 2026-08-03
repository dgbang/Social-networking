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
    return Promise.reject(new Error("Socket chưa kết nối."));
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Yêu cầu socket đã hết thời gian chờ."));
    }, timeoutMs);

    socket.emit(eventName, payload, (response = {}) => {
      window.clearTimeout(timeout);
      if (response.ok) {
        resolve(response);
        return;
      }
      reject(new Error(response.error?.message || "Yêu cầu socket thất bại."));
    });
  });
}
