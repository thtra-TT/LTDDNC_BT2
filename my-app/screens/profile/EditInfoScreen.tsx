import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image
} from "react-native";
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import Constants from "expo-constants";
const BASE_URL = Constants.expoConfig.extra.BASE_URL;


export default function EditInfoScreen() {
  const navigation = useNavigation();
  const { loadUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");


  // ==== đổi email + OTP ====
  const [step, setStep] = useState("none");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpServer, setOtpServer] = useState("");


  // ================= LOAD PROFILE =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/profile");
        const data = res.data;

        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setEmail(data.email || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setAvatar(
          data.avatar
            ? `${BASE_URL}/uploads/${data.avatar}`
            : ""
        );
        console.log("PROFILE DATA:", data);

      } catch (error) {
        console.log("Lỗi load profile:", error);
      }
    };

    loadProfile();
  }, []);

  // ================= PICK AVATAR =================
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      uploadAvatar(image);
    }
  };

  // ================= UPLOAD AVATAR =================
    const uploadAvatar = async (image) => {
      try {
        const formData = new FormData();
        formData.append("avatar", {
          uri: image.uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        });

        const res = await api.put("/profile/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          transformRequest: () => formData,
        });

        const fullUrl = `${BASE_URL}/uploads/${res.data.avatar}`;
        console.log("FULL URL:", fullUrl);

        setAvatar(fullUrl);
        alert("Đổi avatar thành công!");
      } catch (error) {
        console.log("UPLOAD ERROR:", error);
        alert("Không thể upload avatar!");
      }
    };


    const sendOTP = async () => {
      try {
        const res = await api.post("/profile/send-otp", { new_email: newEmail });

        // Lưu OTP server nhận từ backend
        setOtpServer(res.data.otp);

        alert("Đã gửi OTP đến email mới!");
        setStep("verify");
      } catch (error) {
        alert("Không thể gửi OTP");
      }
    };


    const verifyOTP = async () => {
      try {
        await api.post("/profile/verify-otp", {
          otp_client: otp,
          otp_server: otpServer,

          new_email: newEmail,
        });

        alert("Đổi email thành công!");

        setEmail(newEmail);
        setStep("none");
        setNewEmail("");
        setOtp("");
        setOtpServer("");

      } catch (error) {
        alert(error.response?.data?.message || "OTP không chính xác!");
      }
    };




  // ================= SAVE INFO =================
    const saveInfo = async () => {
      try {
        const res = await api.put("/profile/info", {
          full_name: fullName,
          address,
          phone,
        });

        alert(res.data.message);
        navigation.goBack();

      } catch (error) {
        console.log(error.response?.data);

        const msg =
          error.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại!";

        alert(msg);
      }
    };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Avatar */}
        <TouchableOpacity onPress={pickImage} style={{ alignItems: "center" }}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: 90, height: 90, borderRadius: 50 }}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {fullName ? fullName.charAt(0) : "U"}
              </Text>
            </View>
          )}

          <Text style={{ marginTop: 5 }}>Nhấn để đổi avatar</Text>
        </TouchableOpacity>

        {/* FORM */}
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput style={styles.input} value={username} editable={false} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} editable={false} />

        {/* ========== Đổi Email ========== */}
        <View style={styles.changeEmailBox}>
          <Text style={styles.sectionTitle}>Đổi email</Text>

          {step === "none" && (
            <TouchableOpacity
              style={styles.btnSmall}
              onPress={() => setStep("change")}
            >
              <Text style={styles.btnSmallText}>Đổi email</Text>
            </TouchableOpacity>
          )}

          {step === "change" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nhập email mới"
                value={newEmail}
                onChangeText={setNewEmail}
              />

              <TouchableOpacity style={styles.btnSmall} onPress={sendOTP}>
                <Text style={styles.btnSmallText}>Gửi OTP</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "verify" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nhập OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.btnSmall} onPress={verifyOTP}>
                <Text style={styles.btnSmallText}>Xác nhận OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={saveInfo}>
          <Text style={styles.buttonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ==================== STYLE ====================
const styles = StyleSheet.create({
  header: {
    height: 65,
    backgroundColor: "#1E55FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  back: {
    fontSize: 24,
    color: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#5A67D8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  label: {
    marginTop: 18,
    marginBottom: 6,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 25,
    backgroundColor: "#1E55FF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
    changeEmailBox: {
      backgroundColor: "#F1F5FF",
      padding: 12,
      borderRadius: 12,
      marginTop: 20,
    },

    sectionTitle: {
      fontWeight: "700",
      fontSize: 16,
      marginBottom: 10,
      color: "#1E55FF",
    },

    btnSmall: {
      backgroundColor: "#1E55FF",
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },

    btnSmallText: {
      color: "#fff",
      fontWeight: "600",
    },

})