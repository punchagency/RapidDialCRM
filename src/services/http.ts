import axios from "axios";

const rawApiBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/$/, "");

export const getAuthToken = () => localStorage.getItem("auth_token");

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const resolveApiUrl = (path: string): string => {
  if (!path) {
    return rawApiBaseUrl;
  }

  // Already absolute
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  // Normalize to versioned API
  let normalizedPath = path;
  if (path.startsWith("/api/v1")) {
    normalizedPath = path;
  } else if (path.startsWith("/api/")) {
    normalizedPath = `/api/v1${path.slice(4)}`;
  } else if (path.startsWith("/v1")) {
    normalizedPath = path;
  } else {
    normalizedPath = `/api/v1${path.startsWith("/") ? path : `/${path}`}`;
  }

  return `${rawApiBaseUrl}${normalizedPath}`;
};

const https = axios.create({
  baseURL: rawApiBaseUrl,
  withCredentials: true,
  timeout: 10000,
});

https.interceptors.request.use((config) => {
  if (config.url) {
    config.url = resolveApiUrl(config.url);
  }
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

https.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!rawApiBaseUrl) {
      console.warn(
        "API URL not configured. Set VITE_API_URL environment variable."
      );
    }
    console.error("API request failed:", error.message);
    return Promise.reject(error);
  }
);

export default https;
