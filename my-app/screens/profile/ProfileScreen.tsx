import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  const user = {
    full_name: "Phan Thanh Trà",
    email: "tra@gmail.com",
    avatar: "https://i.imgur.com/0y8Ftya.png",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: user.avatar,
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("EditInfo")}
        >
          <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangeEmail")}
        >
          <Text style={styles.menuText}>Đổi email (OTP)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  header: { alignItems: "center", marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  email: { fontSize: 14, color: "#666" },
  menu: { marginTop: 30 },
  menuItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  menuText: { fontSize: 16 },
});
