
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import api from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      Alert.alert("Thành công", res.data.message);
      // router.replace("/(tabs)");
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Đăng nhập thất bại"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>Hello Kitty</Text>
        <Text style={styles.subtitle}>Welcome Back Cutie ~</Text>

        <TextInput
          placeholder="Nhập Email"
          placeholderTextColor="#d39acb"
          keyboardType="email-address"
          style={styles.input}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Nhập Mật Khẩu"
          placeholderTextColor="#d39acb"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <Text style={styles.forgotText}>
          <Text
            style={styles.link}
            onPress={() => router.push("/ForgetPassword")}
          >
            Quên mật khẩu?
          </Text>
        </Text>

        <Text style={styles.footerText}>
          Chưa có tài khoản?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/register")}
          >
            Đăng ký
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f1", // nền hồng pastel
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "90%",
    backgroundColor: "#fff0f7", // trắng pha hồng
    borderRadius: 20,
    padding: 25,
    elevation: 10,
    shadowColor: "#ffb6d9",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: "#ffb6d9",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff69b4",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#d36fa3",
    marginBottom: 20,
  },

  input: {
    borderWidth: 2,
    borderColor: "#ffb6d9",
    backgroundColor: "#ffe6f5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    color: "#d63384",
  },

  button: {
    backgroundColor: "#ff6fb5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#ffb6d9",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  forgotText: {
    textAlign: "center",
    marginTop: 12,
    color: "#c95d9e",
  },

  footerText: {
    textAlign: "center",
    marginTop: 15,
    color: "#c95d9e",
  },

  link: {
    color: "#ff4fa3",
    fontWeight: "bold",
  },
});
