import api from "./axios.js";

export async function getNotifications(params = {}) {
  const res = await api.get("/notifications", { params });
  return {
    notifications: res.data.data.notifications,
    unreadCount: res.data.data.unreadCount,
    nextCursor: res.data.meta.nextCursor,
    hasMore: res.data.meta.hasMore
  };
}

export async function markNotificationRead(id) {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsRead() {
  const res = await api.put("/notifications/read-all");
  return res.data.data;
}
