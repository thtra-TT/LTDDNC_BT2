
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
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
      router.replace({
        pathname: "/welcome",
        params: {
          username: res.data.user.username || "",
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
        
        {/* Hello Kitty Image */}
        <Image
          source={{ uri: 'https://i.pinimg.com/474x/52/3a/4f/523a4f9b649b6138cd9520fe437e433a.jpg' }} 
          style={styles.kitty}
        />

        <Text style={styles.title}>Hello Kitty Login 🎀</Text>
        <Text style={styles.subtitle}>Welcome back sweetie 💗</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#d197b4"
          style={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#d197b4"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/ForgetPassword")}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Chưa có tài khoản?{" "}
          <Text style={styles.link} onPress={() => router.push("/register")}>
            Đăng ký ngay
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc6e0", // nền hồng pastel
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    shadowColor: "#ff69b4",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  kitty: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff4da6",
  },
  subtitle: {
    textAlign: "center",
    color: "#d178a3",
    marginBottom: 24,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#ffe6f2",
    borderRadius: 18,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ffb3d9",
  },
  button: {
    backgroundColor: "#ff4da6",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    width: "100%",
    shadowColor: "#ff4da6",
    elevation: 8,
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  forgotText: {
    textAlign: "center",
    marginTop: 16,
    color: "#ff4da6",
    fontSize: 14,
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#d178a3",
    fontSize: 14,
  },
  link: {
    color: "#ff4da6",
    fontWeight: "bold",
  },
});
