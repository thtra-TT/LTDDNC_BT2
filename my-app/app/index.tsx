import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      const res = await api.post("/login", { email, password });
      // Chuyển đến trang welcome với thông tin user
      router.replace({
        pathname: '/home',
        params: {
          username: res.data.user.username || '',
          email: res.data.user.email || email,
        },
      });
    } catch {
      Alert.alert("Đăng nhập thất bại", "Sai email hoặc mật khẩu");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to my app</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text style={styles.link} onPress={() => router.push("/register")}>
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD6E7", // Hồng pastel
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF0F6", // Hồng nhẹ
    borderRadius: 25,
    padding: 28,
    shadowColor: "#FF8BB3",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#FFB6D9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF4F9A",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#D46A9E",
    marginBottom: 30,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#FFE6F2",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFB6D9",
    color: "#D62478",
  },
  button: {
    backgroundColor: "#FF5CA8",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  forgotText: {
    textAlign: "center",
    marginTop: 15,
    color: "#FF4F9A",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#D46A9E",
    fontSize: 14,
  },
  link: {
    color: "#FF4F9A",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

