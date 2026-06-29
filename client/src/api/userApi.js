import api from "./axios.js";

export async function getMyProfile() {
  const res = await api.get("/users/me");
  return res.data.data.user;
}

export async function getUserProfile(id) {
  const res = await api.get(`/users/${id}`);
  return res.data.data.user;
}

export async function updateMyProfile(payload) {
  const res = await api.put("/users/me", payload);
  return res.data.data.user;
}

export async function searchUsers(q) {
  const res = await api.get("/users/search", { params: { q, limit: 8 } });
  return res.data.data.users;
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  const res = await api.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data.data.user;
}

export async function uploadCover(file) {
  const form = new FormData();
  form.append("cover", file);
  const res = await api.post("/users/me/cover", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data.data.user;
}
