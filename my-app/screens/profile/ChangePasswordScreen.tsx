import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const changePassword = async () => {
    if (!oldPass || !newPass || !confirmPass)
      return alert("Vui lòng nhập đầy đủ thông tin!");

    if (newPass !== confirmPass)
      return alert("Mật khẩu xác nhận không khớp!");

    try {
      const res = await api.put("/profile/change-password", {
        old_password: oldPass,
        new_password: newPass,
      });

      alert(res.data.message || "Đổi mật khẩu thành công!");
      navigation.goBack();

    } catch (err) {
      alert(err.response?.data?.message || "Không thể đổi mật khẩu");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi mật khẩu</Text>

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu hiện tại"
        secureTextEntry
        value={oldPass}
        onChangeText={setOldPass}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
      />

      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu mới"
        secureTextEntry
        value={confirmPass}
        onChangeText={setConfirmPass}
      />

      <TouchableOpacity style={styles.button} onPress={changePassword}>
        <Text style={styles.btnText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#F4F4F4",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6C63FF",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
