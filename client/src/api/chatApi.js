import api from "./axios.js";

export async function getConversations() {
  const res = await api.get("/conversations");
  return res.data.data.conversations;
}

export async function createConversation(payload) {
  const res = await api.post("/conversations", payload);
  return res.data.data.conversation;
}

export async function getMessages(conversationId, params = {}) {
  const res = await api.get(`/conversations/${conversationId}/messages`, { params });
  return {
    messages: res.data.data.messages,
    nextCursor: res.data.meta.nextCursor,
    hasMore: res.data.meta.hasMore
  };
}

export async function sendMessage(conversationId, payload) {
  const res = await api.post(`/conversations/${conversationId}/messages`, payload);
  return res.data.data.message;
}

export async function deleteMessage(id) {
  const res = await api.delete(`/messages/${id}`);
  return res.data.data.message;
}

export async function getOnlineFriends() {
  const res = await api.get("/users/online-friends");
  return res.data.data.users;
}
