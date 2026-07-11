import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getChatUnreadSummary } from "../api/chatApi.js";

export const fetchChatUnreadCount = createAsyncThunk("chatNotifications/fetchUnreadCount", async () => {
  return getChatUnreadSummary();
});

const initialState = {
  unreadCount: 0,
  activeConversationId: null
};

function normalizeCount(value) {
  return Math.max(Number(value) || 0, 0);
}

const chatNotificationsSlice = createSlice({
  name: "chatNotifications",
  initialState,
  reducers: {
    setChatUnreadCount(state, action) {
      state.unreadCount = normalizeCount(action.payload);
    },
    incrementChatUnreadCount(state, action) {
      state.unreadCount += normalizeCount(action.payload ?? 1);
    },
    decrementChatUnreadCount(state, action) {
      state.unreadCount = Math.max(0, state.unreadCount - normalizeCount(action.payload));
    },
    setActiveChatConversation(state, action) {
      state.activeConversationId = action.payload || null;
    },
    resetChatNotifications() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchChatUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = normalizeCount(action.payload?.unreadCount);
    });
  }
});

export const {
  setChatUnreadCount,
  incrementChatUnreadCount,
  decrementChatUnreadCount,
  setActiveChatConversation,
  resetChatNotifications
} = chatNotificationsSlice.actions;

export default chatNotificationsSlice.reducer;
