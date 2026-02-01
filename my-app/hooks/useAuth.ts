import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Constants from "expo-constants";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const BASE_URL = Constants.expoConfig.extra.BASE_URL;

  useEffect(() => {
    loadUser();
  }, []);

    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = await res.json();

        setUser(profile);
        await AsyncStorage.setItem("user", JSON.stringify(profile));
      } catch (error) {
        console.log("Load user failed:", error);
      }
    };

    const saveUser = async (data: any) => {
      console.log("SAVE USER INPUT:", data);

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      //Fetch lại profile
      const res = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      const profile = await res.json();

      await AsyncStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
    };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return { user, saveUser, logout, loadUser };
};
