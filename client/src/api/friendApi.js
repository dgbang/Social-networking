import api from "./axios.js";

function listOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

export async function getFriends() {
  const res = await api.get("/friends");
  return listOrEmpty(res.data?.data?.friends);
}

export async function getFriendRequests() {
  const res = await api.get("/friends/requests");
  return listOrEmpty(res.data?.data?.requests);
}

export async function getFriendSuggestions() {
  const res = await api.get("/friends/suggestions");
  return listOrEmpty(res.data?.data?.suggestions);
}

export async function sendFriendRequest(userId) {
  const res = await api.post(`/friends/request/${userId}`);
  return res.data.data.friendship;
}

export async function acceptFriendRequest(userId) {
  const res = await api.put(`/friends/accept/${userId}`);
  return res.data.data.friendship;
}

export async function rejectFriendRequest(userId) {
  const res = await api.put(`/friends/reject/${userId}`);
  return res.data.data.friendship;
}

export async function unfriend(userId) {
  await api.delete(`/friends/${userId}`);
}
