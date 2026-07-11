import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import chatNotificationsReducer from "./chatNotificationsSlice.js";
import notificationReducer from "./notificationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chatNotifications: chatNotificationsReducer,
    notifications: notificationReducer
  }
});
