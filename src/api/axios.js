import axios from "axios";
import { encryptPayload, decryptPayload } from "../utils/crypto";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Leave file uploads (FormData) alone — only JSON bodies get encrypted.
  // Must match the backend's decryptRequest middleware (middleware/crypto.js).
  if (config.data !== undefined && !(config.data instanceof FormData)) {
    config.data = { payload: await encryptPayload(config.data) };
  }
  return config;
});

async function decryptResponseData(response) {
  if (response?.data && typeof response.data.payload === "string") {
    response.data = await decryptPayload(response.data.payload);
  }
}

api.interceptors.response.use(
  async (res) => {
    await decryptResponseData(res);
    return res;
  },
  async (err) => {
    if (err.response) {
      await decryptResponseData(err.response);
    }
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
