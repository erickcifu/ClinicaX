import axios from "axios";

import {
  getAccessToken,
  removeAccessToken,
} from "../features/auth/storage/auth.storage.js";

export const AUTH_UNAUTHORIZED_EVENT =
  "clinicax:unauthorized";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      getAccessToken()
    ) {
      removeAccessToken();

      window.dispatchEvent(
        new Event(AUTH_UNAUTHORIZED_EVENT)
      );
    }

    return Promise.reject(error);
  }
);
