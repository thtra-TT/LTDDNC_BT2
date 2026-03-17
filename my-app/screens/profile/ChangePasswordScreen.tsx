import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Platform, KeyboardAvoidingView,
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
  error:       "#E53935",
  errorBg:     "#FFF1EE",
  green:       "#00897B",
  greenBg:     "#E0F2F1",
};

// ─── Password input with show/hide ────────────────────────────────────────────
function PasswordField({ label, icon, value, onChangeText, placeholder, hint }: any) {
  const [focused, setFocused] = useState(false);
  const [shown,   setShown]   = useState(false);

  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldLabelRow}>
        <Ionicons name={icon} size={13} color={C.primaryMid} />
        <Text style={s.fieldLabel}>{label}</Text>
      </View>
      <View style={[s.inputWrap, focused && s.inputWrapFocused]}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          secureTextEntry={!shown}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity onPress={() => setShown(v => !v)} style={{ paddingLeft: 8 }}>
          <Ionicons name={shown ? "eye-off-outline" : "eye-outline"} size={18} color={C.text3} />
        </TouchableOpacity>
      </View>
      {hint && <Text style={s.fieldHint}>{hint}</Text>}
    </View>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();

  const [oldPass,     setOldPass]     = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading,     setLoading]     = useState(false);

  // ─── Password strength ───────────────────────────────────────────────────
  const strength = (() => {
    if (!newPass) return 0;
    let score = 0;
    if (newPass.length >= 8)              score++;
    if (/[A-Z]/.test(newPass))            score++;
    if (/[0-9]/.test(newPass))            score++;
    if (/[^A-Za-z0-9]/.test(newPass))     score++;
    return score;
  })();

  const strengthLabel = ["", "Yếu", "Trung bình", "Khá mạnh", "Mạnh"][strength];
  const strengthColor = ["", C.error, "#FF8C00", "#FFC107", C.green][strength];

  const passwordsMatch = confirmPass.length > 0 && newPass === confirmPass;
  const mismatch       = confirmPass.length > 0 && newPass !== confirmPass;

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const changePassword = async () => {
    if (!oldPass || !newPass || !confirmPass)
      return alert("Vui lòng nhập đầy đủ thông tin!");
    if (newPass !== confirmPass)
      return alert("Mật khẩu xác nhận không khớp!");

    setLoading(true);
    try {
      const res = await api.put("/profile/change-password", {
        old_password: oldPass,
        new_password: newPass,
      });
      alert(res.data.message || "Đổi mật khẩu thành công!");
      navigation.goBack();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = oldPass && newPass && confirmPass && newPass === confirmPass && !loading;

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
        <Text style={s.topBarTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── CARD ────────────────────────────────────────────── */}
        <View style={s.card}>
          {/* Icon */}
          <View style={s.cardIcon}>
            <Ionicons name="lock-closed-outline" size={28} color={C.primaryMid} />
          </View>
          <Text style={s.cardTitle}>Tạo mật khẩu mới</Text>
          <Text style={s.cardSub}>Mật khẩu phải có ít nhất 6 ký tự</Text>

          {/* Old password */}
          <PasswordField
            label="Mật khẩu hiện tại"
            icon="lock-open-outline"
            value={oldPass}
            onChangeText={setOldPass}
            placeholder="Nhập mật khẩu hiện tại"
          />

          {/* New password + strength */}
          <PasswordField
            label="Mật khẩu mới"
            icon="lock-closed-outline"
            value={newPass}
            onChangeText={setNewPass}
            placeholder="Tối thiểu 6 ký tự"
          />

          {/* Strength bar */}
          {newPass.length > 0 && (
            <View style={s.strengthWrap}>
              <View style={s.strengthBar}>
                {[1,2,3,4].map(i => (
                  <View
                    key={i}
                    style={[
                      s.strengthSegment,
                      { backgroundColor: i <= strength ? strengthColor : C.border },
                    ]}
                  />
                ))}
              </View>
              <Text style={[s.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
            </View>
          )}

          {/* Confirm password */}
          <PasswordField
            label="Xác nhận mật khẩu mới"
            icon="shield-checkmark-outline"
            value={confirmPass}
            onChangeText={setConfirmPass}
            placeholder="Nhập lại mật khẩu mới"
          />

          {/* Match / mismatch feedback */}
          {passwordsMatch && (
            <View style={s.matchRow}>
              <Ionicons name="checkmark-circle-outline" size={15} color={C.green} />
              <Text style={[s.matchTxt, { color: C.green }]}>Mật khẩu khớp</Text>
            </View>
          )}
          {mismatch && (
            <View style={s.matchRow}>
              <Ionicons name="close-circle-outline" size={15} color={C.error} />
              <Text style={[s.matchTxt, { color: C.error }]}>Mật khẩu không khớp</Text>
            </View>
          )}
        </View>

        {/* ── Tips card ───────────────────────────────────────── */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 Mật khẩu mạnh nên có:</Text>
          {[
            "Ít nhất 8 ký tự",
            "Chữ hoa và chữ thường",
            "Ít nhất một chữ số",
            "Ký tự đặc biệt (!@#$...)",
          ].map((t, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipTxt}>{t}</Text>
            </View>
          ))}
        </View>

        {/* ── Submit ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.btn, !canSubmit && s.btnDisabled]}
          onPress={changePassword}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={19} color="#FFF" />
                <Text style={s.btnTxt}>Xác nhận đổi mật khẩu</Text>
              </>
          }
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  topBar: {
    backgroundColor: C.primaryMid,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16, paddingHorizontal: 14,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden",
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

  scroll: { padding: 16, gap: 14, paddingBottom: 20 },

  card: {
    backgroundColor: C.surface, borderRadius: 24, padding: 24,
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10,
    gap: 14,
  },
  cardIcon: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    alignSelf: "center",
  },
  cardTitle: { fontSize: 20, fontWeight: "900", color: C.text1, textAlign: "center" },
  cardSub:   { fontSize: 14, color: C.text3, textAlign: "center" },

  fieldWrap:     { gap: 7 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  fieldLabel: {
    fontSize: 12, fontWeight: "700", color: C.text2,
    textTransform: "uppercase", letterSpacing: 0.6,
  },
  fieldHint: { fontSize: 11, color: C.text3, marginTop: 2 },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2,
  },
  inputWrapFocused: { borderColor: C.borderFocus, backgroundColor: C.primarySoft },
  input: {
    flex: 1, fontSize: 15, color: C.text1, paddingVertical: 12,
  },

  // Strength
  strengthWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  strengthBar:  { flex: 1, flexDirection: "row", gap: 4 },
  strengthSegment: { flex: 1, height: 5, borderRadius: 3 },
  strengthLabel:   { fontSize: 12, fontWeight: "700", width: 70 },

  // Match feedback
  matchRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  matchTxt:  { fontSize: 13, fontWeight: "600" },

  // Tips
  tipsCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16,
    gap: 8, borderWidth: 1, borderColor: C.border,
  },
  tipsTitle: { fontSize: 13, fontWeight: "700", color: C.text2 },
  tipRow:    { flexDirection: "row", alignItems: "center", gap: 10 },
  tipDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primaryMid, flexShrink: 0 },
  tipTxt:    { fontSize: 13, color: C.text3 },

  // Button
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMid, borderRadius: 16, paddingVertical: 17,
    elevation: 5,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.30, shadowRadius: 12,
  },
  btnDisabled: { backgroundColor: C.text3, elevation: 0, shadowOpacity: 0 },
  btnTxt:      { color: "#FFF", fontSize: 16, fontWeight: "800" },
});