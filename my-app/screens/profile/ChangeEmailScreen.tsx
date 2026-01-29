import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import api from "../../services/api";

export default function ChangeEmailScreen() {
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [step, setStep] = useState(1);

  const sendOTP = async () => {
    await api.post("/profile/send-otp", { new_email: newEmail });
    alert("OTP đã được gửi!");
    setStep(2);
  };

  const verifyOTP = async () => {
    await api.post("/profile/verify-otp", { new_email: newEmail, otp });
    alert("Đổi email thành công!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi Email</Text>

      {step === 1 ? (
        <>
          <TextInput style={styles.input} placeholder="Email mới" onChangeText={setNewEmail} />
          <TouchableOpacity style={styles.button} onPress={sendOTP}>
            <Text style={styles.buttonText}>Gửi OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput style={styles.input} placeholder="Nhập OTP" onChangeText={setOTP} />
          <TouchableOpacity style={styles.button} onPress={verifyOTP}>
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
        </>
      )}
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
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
});
