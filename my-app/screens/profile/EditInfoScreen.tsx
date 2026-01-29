import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";

export default function EditInfoScreen() {
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const saveInfo = async () => {
    try {
      await api.put("/profile/info", {
        full_name: fullName,
        address,
        phone,
      });

      alert("Cập nhật thông tin thành công!");
      navigation.goBack();
    } catch (error) {
      alert("Lỗi cập nhật!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin</Text>

      <TextInput placeholder="Họ tên" style={styles.input} onChangeText={setFullName} />
      <TextInput placeholder="Địa chỉ" style={styles.input} onChangeText={setAddress} />
      <TextInput placeholder="Số điện thoại" style={styles.input} onChangeText={setPhone} />

      <TouchableOpacity style={styles.button} onPress={saveInfo}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
});
