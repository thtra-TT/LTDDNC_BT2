//import axios from 'axios';
//
//import Constants from "expo-constants";
//
//import AsyncStorage from "@react-native-async-storage/async-storage";
//
//const API_URL = Constants.expoConfig.extra.API_URL;
//
//const api = axios.create({
//  baseURL: API_URL,
//});
//
//api.interceptors.request.use(async (config) => {
//  const token = await AsyncStorage.getItem("token");
//
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`;
//  }
//
//  return config;
//});
//
//export default api;
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig.extra.API_URL;
console.log("API_URL:", API_URL); // kiểm tra cho chắc

// Tạo instance API
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// INTERCEPTOR: tự gắn token vào mọi request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("⚠ Không tìm thấy token trong AsyncStorage");
      }
    } catch (error) {
      console.log("Lỗi đọc token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR: log lỗi để debug dễ hơn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("❌ API Error:", error?.response?.status, error?.response?.data);
    return Promise.reject(error);
  }
);

export default api;
