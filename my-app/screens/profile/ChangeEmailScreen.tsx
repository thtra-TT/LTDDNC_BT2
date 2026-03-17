import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Platform, KeyboardAvoidingView,
  ScrollView, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",
  primaryMid:  "#1E88E5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  bg:          "#F0F6FF",
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  borderFocus: "#1E88E5",
  text1:       "#0D1B3E",
  text2:       "#4A5980",
  text3:       "#9AA8C8",
  placeholder: "#B0C4DE",
  green:       "#00897B",
  greenBg:     "#E0F2F1",
};

// ─── Styled input ─────────────────────────────────────────────────────────────
function SInput({ value, onChangeText, placeholder, keyboardType = "default", maxLength = undefined }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[s.input, focused && s.inputFocused]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.placeholder}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize="none"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ChangeEmailScreen() {
  const navigation = useNavigation<any>();
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOTP]           = useState("");
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const sendOTP = async () => {
    setLoading(true);
    try {
      await api.post("/profile/send-otp", { new_email: newEmail });
      alert("OTP đã được gửi!");
      setStep(2);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      await api.post("/profile/verify-otp", { new_email: newEmail, otp });
      alert("Đổi email thành công!");
      navigation.goBack();
    } catch (e: any) {
      alert(e?.response?.data?.message || "OTP không chính xác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topBarBlob} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Đổi Email</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── STEP INDICATOR ──────────────────────────────────── */}
        <View style={s.stepBar}>
          {[1, 2].map(n => (
            <View key={n} style={{ alignItems: "center", gap: 4 }}>
              <View style={[s.stepCircle, step >= n && s.stepCircleActive]}>
                {step > n
                  ? <Ionicons name="checkmark" size={13} color="#FFF" />
                  : <Text style={[s.stepNum, step >= n && { color: "#FFF" }]}>{n}</Text>
                }
              </View>
              <Text style={[s.stepLbl, step >= n && s.stepLblActive]}>
                {n === 1 ? "Nhập email" : "Xác nhận OTP"}
              </Text>
            </View>
          ))}
          <View style={[s.stepLine, step >= 2 && s.stepLineActive]} />
        </View>

        {/* ── STEP 1: Email input ──────────────────────────────── */}
        {step === 1 && (
          <View style={s.card}>
            <View style={s.cardIcon}>
              <Ionicons name="mail-outline" size={28} color={C.primaryMid} />
            </View>
            <Text style={s.cardTitle}>Nhập email mới</Text>
            <Text style={s.cardSub}>
              Mã OTP sẽ được gửi đến địa chỉ email mới của bạn
            </Text>

            <View style={s.fieldWrap}>
              <View style={s.fieldLabelRow}>
                <Ionicons name="at-outline" size={13} color={C.primaryMid} />
                <Text style={s.fieldLabel}>Địa chỉ Email mới</Text>
              </View>
              <SInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={[s.btn, (!newEmail.trim() || loading) && s.btnDisabled]}
              onPress={sendOTP}
              disabled={!newEmail.trim() || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <>
                    <Ionicons name="send-outline" size={17} color="#FFF" />
                    <Text style={s.btnTxt}>Gửi mã OTP</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: OTP verify ───────────────────────────────── */}
        {step === 2 && (
          <View style={s.card}>
            <View style={s.cardIcon}>
              <Ionicons name="keypad-outline" size={28} color={C.primaryMid} />
            </View>
            <Text style={s.cardTitle}>Xác nhận OTP</Text>

            {/* Email pill */}
            <View style={s.emailPill}>
              <Ionicons name="mail-outline" size={14} color={C.primaryMid} />
              <Text style={s.emailPillTxt} numberOfLines={1}>{newEmail}</Text>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={s.emailPillChange}>Đổi</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.cardSub}>
              Nhập mã 6 chữ số đã được gửi đến email trên
            </Text>

            <View style={s.fieldWrap}>
              <View style={s.fieldLabelRow}>
                <Ionicons name="lock-closed-outline" size={13} color={C.primaryMid} />
                <Text style={s.fieldLabel}>Mã OTP (6 số)</Text>
              </View>
              <SInput
                value={otp}
                onChangeText={setOTP}
                placeholder="● ● ● ● ● ●"
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[s.btn, (!otp.trim() || loading) && s.btnDisabled]}
              onPress={verifyOTP}
              disabled={!otp.trim() || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                    <Text style={s.btnTxt}>Xác nhận đổi email</Text>
                  </>
              }
            </TouchableOpacity>

            {/* Resend */}
            <TouchableOpacity
              style={s.resendBtn}
              onPress={sendOTP}
              disabled={loading}
            >
              <Ionicons name="refresh-outline" size={14} color={C.primaryMid} />
              <Text style={s.resendTxt}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Top bar
  topBar: {
    backgroundColor: C.primaryMid,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16, paddingHorizontal: 14,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  topBarBlob: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)", top: -50, right: -30,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  topBarTitle: { fontSize: 17, fontWeight: "800", color: "#FFF" },

  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  // ── Step bar
  stepBar: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 40, position: "relative",
    marginBottom: 4,
  },
  stepLine: {
    position: "absolute", left: "30%", right: "30%", top: 14,
    height: 2, backgroundColor: C.border,
  },
  stepLineActive: { backgroundColor: C.primaryMid },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.bg, borderWidth: 2, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
  },
  stepCircleActive: { backgroundColor: C.primaryMid, borderColor: C.primaryMid },
  stepNum:    { fontSize: 13, fontWeight: "700", color: C.text3 },
  stepLbl:    { fontSize: 11, color: C.text3, fontWeight: "500" },
  stepLblActive: { color: C.primaryMid, fontWeight: "700" },

  // ── Card
  card: {
    backgroundColor: C.surface, borderRadius: 24, padding: 24,
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10,
    gap: 14, alignItems: "stretch",
  },
  cardIcon: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    alignSelf: "center",
  },
  cardTitle: { fontSize: 20, fontWeight: "900", color: C.text1, textAlign: "center" },
  cardSub:   { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 20 },

  // Email pill
  emailPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.primarySoft, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: C.primaryTint,
  },
  emailPillTxt:    { flex: 1, fontSize: 14, color: C.primaryMid, fontWeight: "600" },
  emailPillChange: { fontSize: 13, color: C.primary, fontWeight: "700" },

  // Field
  fieldWrap:     { gap: 7 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  fieldLabel: {
    fontSize: 12, fontWeight: "700", color: C.text2,
    textTransform: "uppercase", letterSpacing: 0.6,
  },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.text1,
  },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.primarySoft },

  // Button
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMid, borderRadius: 16, paddingVertical: 16,
    elevation: 4,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10,
  },
  btnDisabled: { backgroundColor: C.text3, elevation: 0, shadowOpacity: 0 },
  btnTxt:      { color: "#FFF", fontSize: 16, fontWeight: "800" },

  // Resend
  resendBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    paddingVertical: 6,
  },
  resendTxt: { color: C.primaryMid, fontSize: 14, fontWeight: "600" },
});