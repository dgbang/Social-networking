import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios.js";
import { clearStoredAuth, loadStoredAuth, saveStoredAuth } from "../utils/authStorage.js";

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async () => {
    const res = await api.get("/auth/me");
    return res.data.data;
  },
  {
    condition: (_, { getState }) => {
      const { accessToken, initialized, loading } = getState().auth;
      return Boolean(accessToken) && !initialized && !loading;
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
});

const storedAuth = loadStoredAuth();

const initialState = {
  accessToken: storedAuth.accessToken,
  user: storedAuth.user,
  initialized: !storedAuth.accessToken,
  loading: false,
  error: null,
  notice: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.initialized = true;
      state.loading = false;
      state.error = null;
      saveStoredAuth(action.payload);
    },
    clearAuth(state) {
      state.accessToken = null;
      state.user = null;
      state.initialized = true;
      state.loading = false;
      clearStoredAuth();
    },
    setNotice(state, action) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
        state.initialized = true;
        clearStoredAuth();
      })
      .addCase(logoutUser.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.initialized = true;
        clearStoredAuth();
      });
  }
});

export const { setCredentials, clearAuth, setNotice, clearNotice } = authSlice.actions;
export default authSlice.reducer;
