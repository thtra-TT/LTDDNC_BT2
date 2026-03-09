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
  SafeAreaView
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Lấy BASE_URL từ Constants giống file Cart của bạn
const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function AddressForm() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {}; // Nhận id từ màn hình List truyền sang
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    recipient_name: "",
    phone_number: "",
    province: "",
    district: "",
    ward: "",
    specific_address: "",
    is_default: false,
  });

  // Load dữ liệu cũ nếu là chế độ Sửa (id !== null)
  useEffect(() => {
    if (id && user?.id) {
      const fetchOldData = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const res = await fetch(`${BASE_URL}/api/addresses/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const list = await res.json();
          const current = list.find((a: any) => a.id === Number(id));
          if (current) {
            setFormData({
              recipient_name: current.recipient_name || "",
              phone_number: current.phone_number || "",
              province: current.province || "",
              district: current.district || "",
              ward: current.ward || "",
              specific_address: current.specific_address || "",
              is_default: !!current.is_default,
            });
          }
        } catch (error) {
          console.error("Lỗi fetch dữ liệu cũ:", error);
        }
      };
      fetchOldData();
    }
  }, [id, user?.id]);

  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!formData.recipient_name.trim() || !formData.phone_number.trim()) {
      return Alert.alert("Lỗi", "Vui lòng nhập họ tên và số điện thoại!");
    }

    const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone_number)) {
      return Alert.alert("Lỗi", "Số điện thoại không hợp lệ!");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const url = id ? `${BASE_URL}/api/addresses/${id}` : `${BASE_URL}/api/addresses`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // user_id gửi lên khớp với cột user_id trong database của bạn
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{id ? "Cập nhật địa chỉ" : "Thêm mới địa chỉ"}</Text>

        <View style={styles.formGroup}>
          <TextInput
            placeholder="Họ và tên người nhận"
            style={styles.input}
            value={formData.recipient_name}
            onChangeText={(t) => setFormData({...formData, recipient_name: t})}
          />
          <TextInput
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            style={styles.input}
            value={formData.phone_number}
            onChangeText={(t) => setFormData({...formData, phone_number: t})}
          />
          <View style={styles.row}>
            <TextInput placeholder="Tỉnh" style={[styles.input, styles.flex1]} value={formData.province} onChangeText={(t) => setFormData({...formData, province: t})} />
            <TextInput placeholder="Huyện" style={[styles.input, styles.flex1, styles.marginH]} value={formData.district} onChangeText={(t) => setFormData({...formData, district: t})} />
            <TextInput placeholder="Xã" style={[styles.input, styles.flex1]} value={formData.ward} onChangeText={(t) => setFormData({...formData, ward: t})} />
          </View>
          <TextInput
            placeholder="Địa chỉ cụ thể (Số nhà, đường...)"
            multiline
            style={[styles.input, styles.textArea]}
            value={formData.specific_address}
            onChangeText={(t) => setFormData({...formData, specific_address: t})}
          />
          <View style={styles.switchRow}>
            <Text style={styles.label}>Đặt làm địa chỉ mặc định</Text>
            <Switch
              value={formData.is_default}
              onValueChange={(v) => setFormData({...formData, is_default: v})}
              trackColor={{ false: "#767577", true: "#6C63FF" }}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, styles.btnCancel]}>
            <Text style={styles.btnTextBlack}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.btnSave]}>
            <Text style={styles.btnTextWhite}>Lưu địa chỉ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 25, textAlign: "center", color: "#333" },
  formGroup: { gap: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10, fontSize: 16, backgroundColor: "#f9f9f9", color: "#333" },
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  marginH: { marginHorizontal: 8 },
  textArea: { height: 100, textAlignVertical: 'top' },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  label: { fontSize: 16, color: "#333" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 30 },
  button: { flex: 1, padding: 16, borderRadius: 10, alignItems: "center" },
  btnCancel: { backgroundColor: "#f0f0f0" },
  btnSave: { backgroundColor: "#6C63FF" },
  btnTextWhite: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  btnTextBlack: { color: "#333", fontWeight: "bold", fontSize: 16 },
});