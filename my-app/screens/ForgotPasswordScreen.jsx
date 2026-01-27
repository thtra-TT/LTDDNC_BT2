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
import { authService } from "../../services/authService";
import { COLORS, FONTS, SIZES, SHADOWS } from "../../constants/theme";
import { validateEmail, validatePhone, validatePassword } from "../../utils/validation";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [inputType, setInputType] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOTP = async () => {
    if (inputType === "email") {
      if (!email) {
        Alert.alert("Thông báo", "Vui lòng nhập email");
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert("Thông báo", "Email không hợp lệ");
        return;
      }
    } else {
      if (!phone) {
        Alert.alert("Thông báo", "Vui lòng nhập số điện thoại");
        return;
      }
      if (!validatePhone(phone)) {
        Alert.alert("Thông báo", "Số điện thoại không hợp lệ (10-11 số)");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = inputType === "email" ? { email } : { phone };
      const res = await authService.sendOTP(payload);
      Alert.alert("Thành công", res.data.message || "Mã OTP đã được gửi!");
      setStep(2);
    } catch (err) {
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

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      Alert.alert("Thông báo", passwordValidation.message);
      return;
    }

    if (!confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng xác nhận mật khẩu mới");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        otp,
        newPassword,
        ...(inputType === "email" ? { email } : { phone }),
      };

      const res = await authService.resetPassword(payload);

      Alert.alert(
        "Thành công",
        res.data.message || "Đặt lại mật khẩu thành công!",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (err) {
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
      const payload = inputType === "email" ? { email } : { phone };
      await authService.sendOTP(payload);
      Alert.alert("Thành công", "Mã OTP mới đã được gửi!");
    } catch (err) {
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>🔐 Quên Mật Khẩu</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Nhập email hoặc số điện thoại để nhận mã OTP"
              : "Nhập mã OTP và mật khẩu mới"}
          </Text>

          {/* STEP 1: Nhập email/phone */}
          {step === 1 && (
            <>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    inputType === "email" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setInputType("email")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      inputType === "email" && styles.toggleTextActive,
                    ]}
                  >
                    📧 Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    inputType === "phone" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setInputType("phone")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      inputType === "phone" && styles.toggleTextActive,
                    ]}
                  >
                    📱 Số điện thoại
                  </Text>
                </TouchableOpacity>
              </View>

              {inputType === "email" ? (
                <TextInput
                  placeholder="Nhập email của bạn"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              ) : (
                <TextInput
                  placeholder="Nhập số điện thoại (VD: 0901234567)"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={11}
                  editable={!loading}
                />
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2: Nhập OTP + Mật khẩu mới */}
          {step === 2 && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Mã OTP đã được gửi đến:{"\n"}
                  <Text style={styles.infoHighlight}>
                    {inputType === "email" ? email : phone}
                  </Text>
                </Text>
              </View>

              <TextInput
                placeholder="Nhập mã OTP (6 chữ số)"
                placeholderTextColor={COLORS.gray}
                keyboardType="number-pad"
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
                editable={!loading}
              />

              <TextInput
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                placeholderTextColor={COLORS.gray}
                secureTextEntry
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
              />

              <TextInput
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor={COLORS.gray}
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
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={loading}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>
                  Không nhận được mã? Gửi lại OTP
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={styles.backText}>
              {step === 1 ? "← Quay lại đăng nhập" : "← Quay lại"}
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: SIZES.margin * 0.5,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: SIZES.margin * 1.5,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: SIZES.margin * 1.25,
    borderRadius: SIZES.radius * 0.6,
    backgroundColor: COLORS.inputBg,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SIZES.padding * 0.6,
    alignItems: "center",
    borderRadius: SIZES.radius * 0.5,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radius * 0.6,
    padding: SIZES.padding * 0.7,
    fontSize: FONTS.sizes.md,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  infoBox: {
    backgroundColor: COLORS.infoBg,
    padding: SIZES.padding * 0.6,
    borderRadius: SIZES.radius * 0.5,
    marginBottom: SIZES.margin,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  infoHighlight: {
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  resendButton: {
    marginTop: SIZES.margin,
    alignItems: "center",
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
  },
  backButton: {
    marginTop: SIZES.margin * 1.25,
    paddingTop: SIZES.padding * 0.8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },
  backText: {
    color: COLORS.darkGray,
    fontSize: FONTS.sizes.sm,
  },
});
