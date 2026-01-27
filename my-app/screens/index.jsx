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
        pathname: '/welcome',
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
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/ForgetPassword")}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Don’t have an account?{" "}
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
    backgroundColor: "#FFF0F6", // nền hồng rất nhạt
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#F06292",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#E91E63", // hồng đậm
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#FFF5F8", // hồng rất nhạt
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3C1D6",
    color: "#333",
  },
  button: {
    backgroundColor: "#F06292", // hồng chủ đạo
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  forgotText: {
    textAlign: "center",
    marginTop: 15,
    color: "#E91E63",
    fontSize: 14,
  },
  link: {
    color: "#E91E63",
    fontWeight: "bold",
  },
});
