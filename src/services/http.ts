import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

const https = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
});

https.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!apiBaseUrl) {
      console.warn("API URL not configured. Set VITE_API_URL environment variable.");
    }
    console.error("API request failed:", error.message);
    return Promise.reject(error);
  }
);

export default https;
