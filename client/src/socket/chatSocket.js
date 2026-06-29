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
