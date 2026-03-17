import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:    "#1565C0",
  primaryMid: "#1E88E5",
  primarySoft:"#E3F2FD",
  primaryTint:"#BBDEFB",
  bg:         "#F0F6FF",
  surface:    "#FFFFFF",
  border:     "#DDEEFF",
  borderFocus:"#1E88E5",
  text1:      "#0D1B3E",
  text2:      "#4A5980",
  text3:      "#9AA8C8",
  placeholder:"#B0C4DE",
  error:      "#E53935",
};

// ─── Labeled input ────────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldLabel}>
        <Ionicons name={icon} size={15} color={C.primaryMid} />
        <Text style={s.fieldLabelTxt}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Styled TextInput ─────────────────────────────────────────────────────────
function SInput({ value, onChangeText, placeholder, keyboardType = "default", multiline = false, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        s.input,
        focused && s.inputFocused,
        multiline && s.inputMulti,
        style,
      ]}
    />
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AddressForm() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    recipient_name: "",
    phone_number:   "",
    province:       "",
    district:       "",
    ward:           "",
    specific_address: "",
    is_default: false,
  });

  const set = (key: string, val: any) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  // ==========================
  // LOAD OLD DATA (unchanged)
  // ==========================
  useEffect(() => {
    if (id && user?.id) {
      const fetchOldData = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const res   = await fetch(`${BASE_URL}/api/addresses/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list    = await res.json();
          const current = list.find((a: any) => a.id === Number(id));
          if (current) {
            setFormData({
              recipient_name:   current.recipient_name   || "",
              phone_number:     current.phone_number     || "",
              province:         current.province         || "",
              district:         current.district         || "",
              ward:             current.ward             || "",
              specific_address: current.specific_address || "",
              is_default:       !!current.is_default,
            });
          }
        } catch (error) {
          console.error("Lỗi fetch dữ liệu cũ:", error);
        }
      };
      fetchOldData();
    }
  }, [id, user?.id]);

  // ==========================
  // SUBMIT (unchanged)
  // ==========================
  const handleSubmit = async () => {
    if (!formData.recipient_name.trim() || !formData.phone_number.trim()) {
      return Alert.alert("Lỗi", "Vui lòng nhập họ tên và số điện thoại!");
    }
    const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone_number)) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ!");
    }

    try {
      const token  = await AsyncStorage.getItem("token");
      const url    = id ? `${BASE_URL}/api/addresses/${id}` : `${BASE_URL}/api/addresses`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, userId: user?.id }),
      });

      if (response.ok) {
        Alert.alert("Thành công", id ? "Cập nhật thành công!" : "Đã thêm địa chỉ!");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Kết nối server thất bại");
    }
  };

  const isEdit = !!id;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>
          {isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Info card ────────────────────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="person-circle-outline" size={20} color={C.primaryMid} />
            <Text style={s.cardHeaderTxt}>Thông tin người nhận</Text>
          </View>

          <Field label="Họ và tên" icon="person-outline">
            <SInput
              value={formData.recipient_name}
              onChangeText={t => set("recipient_name", t)}
              placeholder="Nguyễn Văn A"
            />
          </Field>

          <Field label="Số điện thoại" icon="call-outline">
            <SInput
              value={formData.phone_number}
              onChangeText={t => set("phone_number", t)}
              placeholder="0901234567"
              keyboardType="phone-pad"
            />
          </Field>
        </View>

        {/* ── Address card ─────────────────────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="location-outline" size={20} color={C.primaryMid} />
            <Text style={s.cardHeaderTxt}>Địa chỉ giao hàng</Text>
          </View>

          {/* Province / District / Ward — 3 cols */}
          <View style={s.row3}>
            <View style={{ flex: 1 }}>
              <Text style={s.miniLabel}>Tỉnh / TP</Text>
              <SInput
                value={formData.province}
                onChangeText={t => set("province", t)}
                placeholder="Hồ Chí Minh"
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <Text style={s.miniLabel}>Quận / Huyện</Text>
              <SInput
                value={formData.district}
                onChangeText={t => set("district", t)}
                placeholder="Quận 10"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.miniLabel}>Phường / Xã</Text>
              <SInput
                value={formData.ward}
                onChangeText={t => set("ward", t)}
                placeholder="P.14"
              />
            </View>
          </View>

          <Field label="Địa chỉ cụ thể" icon="home-outline">
            <SInput
              value={formData.specific_address}
              onChangeText={t => set("specific_address", t)}
              placeholder="Số nhà, tên đường, tòa nhà..."
              multiline
            />
          </Field>
        </View>

        {/* ── Default toggle card ───────────────────────────────────── */}
        <View style={s.toggleCard}>
          <View style={s.toggleLeft}>
            <View style={s.toggleIconWrap}>
              <Ionicons name="star-outline" size={18} color={C.primaryMid} />
            </View>
            <View>
              <Text style={s.toggleTitle}>Địa chỉ mặc định</Text>
              <Text style={s.toggleSub}>Tự động chọn khi thanh toán</Text>
            </View>
          </View>
          <Switch
            value={formData.is_default}
            onValueChange={v => set("is_default", v)}
            trackColor={{ false: "#D0DCF0", true: C.primaryMid }}
            thumbColor={formData.is_default ? "#FFF" : "#FFF"}
            ios_backgroundColor="#D0DCF0"
          />
        </View>

        {/* ── Action buttons ────────────────────────────────────────── */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.btnCancel}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="close-outline" size={18} color={C.text2} />
            <Text style={s.btnCancelTxt}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnSave}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Ionicons name={isEdit ? "checkmark-outline" : "add-outline"} size={18} color="#FFF" />
            <Text style={s.btnSaveTxt}>{isEdit ? "Cập nhật" : "Lưu địa chỉ"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // ── Top bar
  topBar: {
    backgroundColor: C.primaryMid,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 14 : 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  topBarTitle: {
    fontSize: 17, fontWeight: "800", color: "#FFF", letterSpacing: 0.2,
  },

  scroll: {
    padding: 16, gap: 12, paddingBottom: 40,
  },

  // ── Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1, borderColor: C.border,
  },
  cardHeaderTxt: {
    fontSize: 15, fontWeight: "800", color: C.text1,
  },

  // ── Field
  fieldWrap: { gap: 6 },
  fieldLabel: {
    flexDirection: "row", alignItems: "center", gap: 5,
  },
  fieldLabelTxt: {
    fontSize: 12, fontWeight: "700", color: C.text2,
    textTransform: "uppercase", letterSpacing: 0.6,
  },
  miniLabel: {
    fontSize: 11, fontWeight: "700", color: C.text2,
    textTransform: "uppercase", letterSpacing: 0.6,
    marginBottom: 5,
  },

  // ── Input
  input: {
    backgroundColor: C.bg,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: C.text1,
  },
  inputFocused: {
    borderColor: C.borderFocus,
    backgroundColor: C.primarySoft,
  },
  inputMulti: {
    height: 100, textAlignVertical: "top",
  },

  row3: { flexDirection: "row" },

  // ── Toggle card
  toggleCard: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 16,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  toggleIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  toggleTitle: { fontSize: 15, fontWeight: "700", color: C.text1 },
  toggleSub: { fontSize: 12, color: C.text3, marginTop: 2 },

  // ── Buttons
  btnRow: {
    flexDirection: "row", gap: 12, marginTop: 8,
  },
  btnCancel: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 16,
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
  },
  btnCancelTxt: { fontSize: 15, fontWeight: "700", color: C.text2 },
  btnSave: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 16,
    backgroundColor: C.primaryMid, borderRadius: 16,
    elevation: 4,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10,
  },
  btnSaveTxt: { fontSize: 15, fontWeight: "800", color: "#FFF" },
});