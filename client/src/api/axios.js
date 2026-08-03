import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let getAccessToken = () => null;
let onRefreshCredentials = () => {};
let onUnauthorized = () => {};
let refreshRequest = null;

const authRequestsWithoutRefresh = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password"
];

function skipsTokenRefresh(config) {
  const url = config?.url || "";
  return config?._skipTokenRefresh || authRequestsWithoutRefresh.some((path) => url.includes(path));
}

function setAuthorization(config, accessToken) {
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${accessToken}`;
}

function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = api
      .post("/auth/refresh-token", undefined, { _skipTokenRefresh: true })
      .then((response) => {
        const credentials = response.data.data;
        onRefreshCredentials(credentials);
        return credentials.accessToken;
      })
      .catch((error) => {
        onUnauthorized();
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

export function configureApiAuth(handlers) {
  getAccessToken = handlers.getAccessToken || getAccessToken;
  onRefreshCredentials = handlers.onRefreshCredentials || onRefreshCredentials;
  onUnauthorized = handlers.onUnauthorized || onUnauthorized;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && getAccessToken() && !original?._retry && !skipsTokenRefresh(original)) {
      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        setAuthorization(original, accessToken);
        return api(original);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
