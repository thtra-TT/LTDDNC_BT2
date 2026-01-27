import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import api from "../services/api";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Thông báo", "Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/forgot-password/send-otp", { email });
      Alert.alert("Thành công", res.data.message || "Mã OTP đã được gửi!");
      setStep(2);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP và đặt lại mật khẩu
  const handleResetPassword = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Thông báo", "Vui lòng nhập mã OTP 6 chữ số");
      return;
    }

    if (!newPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Thông báo", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/forgot-password/reset-password", {
        email,
        otp,
        newPassword,
      });

      Alert.alert(
        "Thành công",
        res.data.message || "Đặt lại mật khẩu thành công!",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await api.post("/forgot-password/send-otp", { email });
      Alert.alert("Thành công", "Mã OTP mới đã được gửi!");
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi lại OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      router.replace("/");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Nhập email để nhận mã OTP"
              : "Nhập mã OTP và mật khẩu mới"}
          </Text>

          {step === 1 ? (
            <>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                placeholder="Mã OTP (6 số)"
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                editable={!loading}
              />

              <TextInput
                placeholder="Mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
              />

              <TextInput
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>
              {step === 1 ? "Quay lại đăng nhập" : "Quay lại"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6C63FF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#6C63FF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#A5A0FF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: 15,
    alignItems: "center",
  },
  resendText: {
    color: "#6C63FF",
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: "#666",
    fontSize: 14,
  },
});
