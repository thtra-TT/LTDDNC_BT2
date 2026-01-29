import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import api from "../../services/api";

export default function ChangePasswordScreen() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const changePassword = async () => {
    try {
      await api.put("/profile/change-password", {
        old_password: oldPass,
        new_password: newPass,
      });

      alert("Đổi mật khẩu thành công!");
    } catch {
      alert("Sai mật khẩu hoặc lỗi server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi mật khẩu</Text>

      <TextInput placeholder="Mật khẩu cũ" secureTextEntry style={styles.input} onChangeText={setOldPass} />
      <TextInput placeholder="Mật khẩu mới" secureTextEntry style={styles.input} onChangeText={setNewPass} />

      <TouchableOpacity style={styles.button} onPress={changePassword}>
        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  input: {
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#FF5CA8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
});
