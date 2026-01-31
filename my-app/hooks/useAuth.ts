// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useEffect, useState } from "react";
//
// export const useAuth = () => {
//   const [user, setUser] = useState<any>(null);
//
//   // Load user khi mở app
//   useEffect(() => {
//     loadUser();
//   }, []);
//
//   const loadUser = async () => {
//     try {
//       const json = await AsyncStorage.getItem("user");
//       if (json) setUser(JSON.parse(json));
//     } catch (error) {
//       console.log("Load user failed:", error);
//     }
//   };
//
//   // Lưu user sau khi login
//   const saveUser = async (data: any) => {
//     await AsyncStorage.setItem("user", JSON.stringify(data));
//     setUser(data);
//   };
//
//   // Đăng xuất
//   const logout = async () => {
//     await AsyncStorage.removeItem("user");
//     setUser(null);
//   };
//
//   return { user, saveUser, logout };
// };

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const json = await AsyncStorage.getItem("user");
      if (json) setUser(JSON.parse(json));
    } catch (error) {
      console.log("Load user failed:", error);
    }
  };

  // Lưu user + token
  const saveUser = async (data: any) => {
    await AsyncStorage.setItem("user", JSON.stringify(data));

    // ⭐ LƯU TOKEN RIÊNG LẺ ĐỂ API.JS LẤY ĐƯỢC
    if (data.token) {
      await AsyncStorage.setItem("token", data.token);
      console.log("Đã lưu token:", data.token);
    }

    setUser(data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token"); // ⭐ Xóa token khi logout
    setUser(null);
  };

  return { user, saveUser, logout };
};
