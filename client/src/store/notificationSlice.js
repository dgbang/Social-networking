import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notificationApi.js";

export const fetchNotifications = createAsyncThunk("notifications/fetch", async (params = {}) => {
  return getNotifications(params);
});

export const readNotification = createAsyncThunk("notifications/read", async (id) => {
  return markNotificationRead(id);
});

export const readAllNotifications = createAsyncThunk("notifications/readAll", async () => {
  return markAllNotificationsRead();
});

const initialState = {
  items: [],
  unreadCount: 0,
  nextCursor: null,
  hasMore: false,
  loading: false,
  error: null,
  toast: null
};

function normalizeCount(value) {
  return Math.max(Number(value) || 0, 0);
}

function mergeNotifications(current, incoming, append = false) {
  const map = new Map();
  const ordered = append ? [...current, ...incoming] : [...incoming, ...current];
  ordered.forEach((item) => {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    receiveNotification(state, action) {
      const notification = action.payload;
      if (!notification?.id) return;
      state.items = mergeNotifications(state.items, [notification]);
      if (!notification.isRead) {
        state.unreadCount += 1;
      }
      state.toast = notification;
    },
    setNotificationUnreadCount(state, action) {
      state.unreadCount = normalizeCount(action.payload);
    },
    clearNotificationToast(state) {
      state.toast = null;
    },
    resetNotifications() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const append = Boolean(action.meta.arg?.append);
        state.loading = false;
        state.items = append
          ? mergeNotifications(state.items, action.payload.notifications || [], true)
          : action.payload.notifications || [];
        state.unreadCount = normalizeCount(action.payload.unreadCount);
        state.nextCursor = action.payload.nextCursor || null;
        state.hasMore = Boolean(action.payload.hasMore);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Khong tai duoc notifications.";
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        const updated = action.payload.notification;
        if (updated?.id) {
          state.items = state.items.map((item) => (item.id === updated.id ? updated : item));
        }
        state.unreadCount = normalizeCount(action.payload.unreadCount);
      })
      .addCase(readAllNotifications.fulfilled, (state, action) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = normalizeCount(action.payload.unreadCount);
      });
  }
});

export const { receiveNotification, setNotificationUnreadCount, clearNotificationToast, resetNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
