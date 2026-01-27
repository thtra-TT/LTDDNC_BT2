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
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { authService } from "../../services/authService";
import { COLORS, FONTS, SIZES, SHADOWS } from "../../constants/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      
      // Lưu user vào Redux store
      dispatch(setUser({
        username: res.data.user.username || '',
        email: res.data.user.email || email,
      }));

      // Chuyển đến trang welcome
      router.replace('/welcome');
    } catch (err) {
      Alert.alert(
        "Đăng nhập thất bại",
        err?.response?.data?.message || "Sai email hoặc mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={COLORS.gray}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.gray}
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "ĐANG XỬ LÝ..." : "LOGIN"}
          </Text>
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
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    textAlign: "center",
    color: COLORS.text,
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.gray,
    marginBottom: SIZES.margin * 1.5,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radius * 0.6,
    padding: SIZES.padding * 0.7,
    fontSize: FONTS.sizes.md,
    marginBottom: SIZES.margin,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.7,
    borderRadius: SIZES.radius * 0.6,
    alignItems: "center",
    marginTop: SIZES.margin * 0.5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  footerText: {
    textAlign: "center",
    marginTop: SIZES.margin * 1.5,
    color: COLORS.darkGray,
  },
  forgotText: {
    textAlign: "center",
    marginTop: SIZES.margin,
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
  },
  link: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});
