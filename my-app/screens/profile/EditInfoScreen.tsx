import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Image,
  StatusBar, Platform, Alert,
} from "react-native";
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

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
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon, children }: any) {
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldLabelRow}>
        <Ionicons name={icon} size={13} color={C.primaryMid} />
        <Text style={s.fieldLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Styled input ─────────────────────────────────────────────────────────────
function SInput({ value, onChangeText, placeholder, keyboardType = "default",
  editable = true, multiline = false, style = {} }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[
        s.input,
        focused && editable && s.inputFocused,
        !editable && s.inputDisabled,
        multiline && { height: 80, textAlignVertical: "top" },
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.placeholder}
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon as any} size={15} color={C.primaryMid} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function EditInfoScreen() {
  const navigation = useNavigation<any>();
  const { loadUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [address, setAddress]   = useState("");
  const [phone, setPhone]       = useState("");
  const [avatar, setAvatar]     = useState("");

  // Email change flow
  const [step, setStep]         = useState("none");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp]           = useState("");
  const [otpServer, setOtpServer] = useState("");

  // ==========================
  // API LOGIC (all unchanged)
  // ==========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res  = await api.get("/profile");
        const data = res.data;
        setFullName(data.full_name || "");
        setUsername(data.username  || "");
        setEmail(data.email        || "");
        setAddress(data.address    || "");
        setPhone(data.phone        || "");
        setAvatar(data.avatar ? `${BASE_URL}/uploads/${data.avatar}` : "");
        console.log("PROFILE DATA:", data);
      } catch (error) {
        console.log("Lỗi load profile:", error);
      }
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 1,
    });
    if (!result.canceled) uploadAvatar(result.assets[0]);
  };

  const uploadAvatar = async (image: any) => {
    try {
      const formData = new FormData();
      formData.append("avatar", { uri: image.uri, name: "avatar.jpg", type: "image/jpeg" } as any);
      const res = await api.put("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data", Accept: "application/json" },
        transformRequest: () => formData,
      });
      setAvatar(`${BASE_URL}/uploads/${res.data.avatar}`);
      alert("Đổi avatar thành công!");
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      alert("Không thể upload avatar!");
    }
  };

  const sendOTP = async () => {
    try {
      const res = await api.post("/profile/send-otp", { new_email: newEmail });
      setOtpServer(res.data.otp);
      alert("Đã gửi OTP đến email mới!");
      setStep("verify");
    } catch { alert("Không thể gửi OTP"); }
  };

  const verifyOTP = async () => {
    try {
      await api.post("/profile/verify-otp", {
        otp_client: otp, otp_server: otpServer, new_email: newEmail,
      });
      alert("Đổi email thành công!");
      setEmail(newEmail); setStep("none"); setNewEmail(""); setOtp(""); setOtpServer("");
    } catch (error: any) {
      alert(error.response?.data?.message || "OTP không chính xác!");
    }
  };

  const saveInfo = async () => {
    try {
      const res = await api.put("/profile/info", { full_name: fullName, address, phone });
      alert(res.data.message);
      navigation.goBack();
    } catch (error: any) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Không thể cập nhật thông tin. Vui lòng thử lại!");
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── TOP BAR ────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topBarBlob} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── AVATAR ──────────────────────────────────────────── */}
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={s.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={s.avatarImg} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarLetter}>
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
            )}
            {/* Camera overlay */}
            <View style={s.cameraOverlay}>
              <Ionicons name="camera-outline" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={s.avatarHint}>Nhấn để đổi ảnh đại diện</Text>
        </View>

        {/* ── PERSONAL INFO CARD ──────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="person-outline" title="Thông tin cá nhân" />

          <Field label="Họ và tên" icon="text-outline">
            <SInput value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />
          </Field>

          <Field label="Tên đăng nhập" icon="at-outline">
            <View style={s.readonlyWrap}>
              <SInput value={username} editable={false} />
              <View style={s.readonlyBadge}>
                <Ionicons name="lock-closed-outline" size={12} color={C.text3} />
                <Text style={s.readonlyBadgeTxt}>Không đổi được</Text>
              </View>
            </View>
          </Field>

          <Field label="Email hiện tại" icon="mail-outline">
            <View style={s.readonlyWrap}>
              <SInput value={email} editable={false} />
            </View>
          </Field>
        </View>

        {/* ── CHANGE EMAIL CARD ────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="mail-outline" title="Đổi địa chỉ Email" />

          {step === "none" && (
            <TouchableOpacity style={s.outlineBtn} onPress={() => setStep("change")} activeOpacity={0.8}>
              <Ionicons name="swap-horizontal-outline" size={16} color={C.primaryMid} />
              <Text style={s.outlineBtnTxt}>Bắt đầu đổi email</Text>
            </TouchableOpacity>
          )}

          {step === "change" && (
            <View style={{ gap: 12 }}>
              <Field label="Email mới" icon="mail-outline">
                <SInput
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="email_moi@example.com"
                  keyboardType="email-address"
                />
              </Field>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={[s.outlineBtn, { flex: 1 }]}
                  onPress={() => { setStep("none"); setNewEmail(""); }}
                >
                  <Text style={s.outlineBtnTxt}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.solidBtn, { flex: 2 }]} onPress={sendOTP} activeOpacity={0.85}>
                  <Ionicons name="send-outline" size={15} color="#FFF" />
                  <Text style={s.solidBtnTxt}>Gửi OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === "verify" && (
            <View style={{ gap: 12 }}>
              {/* Email info pill */}
              <View style={s.emailPill}>
                <Ionicons name="mail-outline" size={14} color={C.primaryMid} />
                <Text style={s.emailPillTxt} numberOfLines={1}>{newEmail}</Text>
              </View>
              <Field label="Mã OTP (6 số)" icon="keypad-outline">
                <SInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="● ● ● ● ● ●"
                  keyboardType="numeric"
                />
              </Field>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={[s.outlineBtn, { flex: 1 }]}
                  onPress={() => setStep("change")}
                >
                  <Text style={s.outlineBtnTxt}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.solidBtn, { flex: 2 }]} onPress={verifyOTP} activeOpacity={0.85}>
                  <Ionicons name="checkmark-circle-outline" size={15} color="#FFF" />
                  <Text style={s.solidBtnTxt}>Xác nhận OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── CONTACT INFO CARD ────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="call-outline" title="Thông tin liên hệ" />

          <Field label="Số điện thoại" icon="call-outline">
            <SInput
              value={phone}
              onChangeText={setPhone}
              placeholder="0901234567"
              keyboardType="numeric"
            />
          </Field>

          <Field label="Địa chỉ" icon="location-outline">
            <SInput
              value={address}
              onChangeText={setAddress}
              placeholder="Số nhà, đường, quận, thành phố..."
              multiline
            />
          </Field>
        </View>

        {/* ── SAVE BUTTON ─────────────────────────────────────── */}
        <TouchableOpacity style={s.saveBtn} onPress={saveInfo} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
          <Text style={s.saveBtnTxt}>Lưu thay đổi</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Top bar
  topBar: {
    backgroundColor: C.primaryMid,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
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

  scroll: { padding: 16, gap: 14, paddingBottom: 20 },

  // ── Avatar
  avatarSection: { alignItems: "center", gap: 8, paddingVertical: 6 },
  avatarWrap:    { position: "relative" },
  avatarImg: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: C.primaryTint,
  },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: C.primaryMid,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: C.primaryTint,
  },
  avatarLetter: { fontSize: 38, fontWeight: "900", color: "#FFF" },
  cameraOverlay: {
    position: "absolute", bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.primary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#FFF",
    elevation: 3,
  },
  avatarHint: { fontSize: 13, color: C.text3, fontWeight: "500" },

  // ── Card
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 18,
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
    gap: 14,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: C.text1 },

  // ── Field
  fieldWrap: { gap: 6 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  fieldLabel: {
    fontSize: 12, fontWeight: "700", color: C.text2,
    textTransform: "uppercase", letterSpacing: 0.6,
  },

  input: {
    backgroundColor: C.bg,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: C.text1,
  },
  inputFocused:  { borderColor: C.borderFocus, backgroundColor: C.primarySoft },
  inputDisabled: { opacity: 0.65 },

  readonlyWrap: { gap: 5 },
  readonlyBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: C.bg, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.border,
  },
  readonlyBadgeTxt: { fontSize: 11, color: C.text3 },

  // Email pill
  emailPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.primarySoft, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: C.primaryTint,
  },
  emailPillTxt: { flex: 1, fontSize: 13, color: C.primaryMid, fontWeight: "600" },

  // Buttons
  outlineBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1.5, borderColor: C.primaryTint,
    borderRadius: 14, paddingVertical: 12,
    backgroundColor: C.primarySoft,
  },
  outlineBtnTxt: { fontSize: 14, color: C.primaryMid, fontWeight: "700" },

  solidBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: C.primaryMid, borderRadius: 14, paddingVertical: 12,
    elevation: 3,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 8,
  },
  solidBtnTxt: { color: "#FFF", fontSize: 14, fontWeight: "700" },

  // Save
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMid, borderRadius: 16, paddingVertical: 17,
    elevation: 5,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.30, shadowRadius: 12,
  },
  saveBtnTxt: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});