// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
// import api from "../../services/api";
// import { useNavigation } from "@react-navigation/native";
//
// export default function EditInfoScreen() {
//   const navigation = useNavigation<any>();
//
//   const [fullName, setFullName] = useState("");
//   const [address, setAddress] = useState("");
//   const [phone, setPhone] = useState("");
//
//   const saveInfo = async () => {
//     try {
//       await api.put("/profile/info", {
//         full_name: fullName,
//         address,
//         phone,
//       });
//
//       alert("Cập nhật thông tin thành công!");
//       navigation.goBack();
//     } catch (error) {
//       alert("Lỗi cập nhật!");
//     }
//   };
//
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Chỉnh sửa thông tin</Text>
//
//       <TextInput placeholder="Họ tên" style={styles.input} onChangeText={setFullName} />
//       <TextInput placeholder="Địa chỉ" style={styles.input} onChangeText={setAddress} />
//       <TextInput placeholder="Số điện thoại" style={styles.input} onChangeText={setPhone} />
//
//       <TouchableOpacity style={styles.button} onPress={saveInfo}>
//         <Text style={styles.buttonText}>Lưu thay đổi</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   input: {
//     backgroundColor: "#EEE",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: "#6C63FF",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   buttonText: { color: "#FFF", fontWeight: "bold" },
// });
//
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image
// } from "react-native";
// import api from "../../services/api";
// import { useNavigation } from "@react-navigation/native";
// import * as ImagePicker from "expo-image-picker";
// import * as FileSystem from "expo-file-system";
//
// export default function EditInfoScreen() {
//   const navigation = useNavigation();
//
//   const [fullName, setFullName] = useState("");
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [address, setAddress] = useState("");
//   const [phone, setPhone] = useState("");
//   const [avatar, setAvatar] = useState("");
//
//   // ===== Load profile từ API =====
//   useEffect(() => {
// //     const loadProfile = async () => {
// //       try {
// //         const res = await api.get("/profile")
// //         .then(res => console.log("PROFILE:", res.data)).catch(err => console.log("Lỗi:", err));;
// //         const data = res.data;
// //
// //         setFullName(data.full_name || "");
// //         setUsername(data.username || "");
// //         setEmail(data.email || "");
// //         setAddress(data.address || "");
// //         setPhone(data.phone || "");
// //         setAvatar(data.avatar || "");
// //       } catch (error) {
// //         console.log("Lỗi load profile:", error);
// //       }
// //     };
//     const loadProfile = async () => {
//       try {
//         const res = await api.get("/profile");
//         const data = res.data;
//
//         console.log("PROFILE: ", data);
//
//         setFullName(data.full_name || "");
//         setUsername(data.username || "");
//         setEmail(data.email || "");
//         setAddress(data.address || "");
//         setPhone(data.phone || "");
//         setAvatar(data.avatar || "");
//
//       } catch (error) {
//         console.log("Lỗi load profile:", error);
//       }
//     };
//
//
//
//     loadProfile();
//   }, []);
//
//   // ================= PICK AVATAR =================
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });
//
//     if (!result.canceled) {
//       const image = result.assets[0];
//       uploadAvatar(image);
//     }
//   };
//   // ===== Lưu thông tin =====
//   const saveInfo = async () => {
//     try {
//       await api.put("/profile/info", {
//         full_name: fullName,
//         address,
//         phone,
//       });
//
//       alert("Cập nhật thành công!");
//       navigation.goBack();
//     } catch (error) {
//       alert("Lỗi cập nhật!");
//     }
//   };
//
//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.back}>←</Text>
//         </TouchableOpacity>
//
//         <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
//
//         <View style={{ width: 20 }} />
//       </View>
//
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//
//         {/* Avatar */}
//         <View style={{ alignItems: "center", marginTop: 10 }}>
//           {avatar ? (
//             <Image
//               source={{ uri: avatar }}
//               style={{ width: 90, height: 90, borderRadius: 50 }}
//             />
//           ) : (
//             <View style={styles.avatar}>
//               <Text style={styles.avatarLetter}>
//                 {fullName ? fullName.charAt(0).toUpperCase() : "U"}
//               </Text>
//             </View>
//           )}
//
//           <Text style={{ marginTop: 5, color: "#777" }}>
//             Nhấn vào avatar để thay đổi
//           </Text>
//         </View>
//
//         {/* Form inputs */}
//         <Text style={styles.label}>Họ và tên</Text>
//         <TextInput
//           style={styles.input}
//           value={fullName}
//           onChangeText={setFullName}
//         />
//
//         <Text style={styles.label}>Tên đăng nhập</Text>
//         <TextInput style={styles.input} value={username} editable={false} />
//
//         <Text style={styles.label}>Email</Text>
//         <TextInput style={styles.input} value={email} editable={false} />
//
//         <Text style={styles.label}>Số điện thoại</Text>
//         <TextInput
//           style={styles.input}
//           value={phone}
//           onChangeText={setPhone}
//           keyboardType="numeric"
//         />
//
//         <Text style={styles.label}>Địa chỉ</Text>
//         <TextInput
//           style={[styles.input, { height: 70 }]}
//           value={address}
//           onChangeText={setAddress}
//           multiline
//         />
//
//         <TouchableOpacity style={styles.button} onPress={saveInfo}>
//           <Text style={styles.buttonText}>Lưu thay đổi</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }
//
// // ==================== STYLE ====================
// const styles = StyleSheet.create({
//   header: {
//     height: 65,
//     backgroundColor: "#1E55FF",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     paddingTop: 10,
//   },
//   back: {
//     fontSize: 24,
//     color: "#fff",
//   },
//   headerTitle: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 20,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   avatar: {
//     width: 90,
//     height: 90,
//     borderRadius: 50,
//     backgroundColor: "#5A67D8",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarLetter: {
//     color: "#fff",
//     fontSize: 36,
//     fontWeight: "bold",
//   },
//   label: {
//     marginTop: 18,
//     marginBottom: 6,
//     fontWeight: "600",
//     color: "#333",
//   },
//   input: {
//     backgroundColor: "#F4F4F4",
//     borderRadius: 12,
//     padding: 12,
//     fontSize: 16,
//   },
//   button: {
//     marginTop: 25,
//     backgroundColor: "#1E55FF",
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//   },
// });











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

export default function EditInfoScreen() {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

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
        setAvatar(data.avatar || "");
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAvatar(res.data.avatar_url);
      alert("Đổi avatar thành công!");

    } catch (error) {
      console.log(error);
      alert("Không thể upload avatar");
    }
  };

    const sendOTP = async () => {
      try {
        await api.post("/profile/send-otp", { new_email });
        alert("OTP đã được gửi đến email mới!");
        setStep("verify");
      } catch (error) {
        alert("Gửi OTP thất bại");
      }
    };
    const verifyOTP = async () => {
      try {
        await api.post("/profile/verify-otp", {
          otp,
          new_email,
        });

        alert("Đổi email thành công!");
      } catch (error) {
        alert("OTP không chính xác!");
      }
    };


  // ================= SAVE INFO =================
//   const saveInfo = async () => {
//     try {
//       await api.put("/profile/info", {
//         full_name: fullName,
//         address,
//         phone,
//       });
//
//       alert("Cập nhật thành công!");
//       navigation.goBack();
//     } catch (error) {
//       alert("Lỗi cập nhật!");
//     }
//   };

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
})