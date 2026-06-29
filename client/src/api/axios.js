import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let getAccessToken = () => null;
let onRefreshCredentials = () => {};
let onUnauthorized = () => {};

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
    if (error.response?.status === 401 && !original?._retry && !original?.url?.includes("/auth/refresh-token")) {
      original._retry = true;
      try {
        const res = await api.post("/auth/refresh-token");
        onRefreshCredentials(res.data.data);
        original.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
