import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
  baseURL: "http://192.168.1.13:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const tokenData = await SecureStore.getItemAsync("userToken");
  if (tokenData) {
    const parsed = JSON.parse(tokenData);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});