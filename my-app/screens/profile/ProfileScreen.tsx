import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";  // lấy user từ DB
import Constants from "expo-constants";
const API_URL = Constants.expoConfig.extra.API_URL;
const BASE_URL = Constants.expoConfig.extra.BASE_URL;

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth(); // user thật từ backend
  console.log("USER DATA FROM CONTEXT:", user);
  console.log("AVATAR URL:", `${BASE_URL}/uploads/${user?.avatar}`);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Tài khoản</Text>
          <Ionicons name="notifications-outline" size={26} color="#fff" />
        </View>

        {/* THÊM KHOẢNG TRỐNG ↓ */}
        <View style={{ height: 20 }} />

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri: user?.avatar
                  ? `${BASE_URL}/uploads/${user.avatar}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              onError={(err) => console.log("🔥 IMAGE ERROR:", err.nativeEvent.error)}
              style={styles.avatar}
            />




            <View style={{ marginLeft: 15 }}>
              <Text style={styles.name}>{user?.username || "No Name"}</Text>
              <Text style={styles.username}>@{user?.username}</Text>

              <TouchableOpacity onPress={() => navigation.navigate("EditInfo")}>
                <Text style={styles.editText}>Chỉnh sửa hồ sơ →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CONTACT INFO */}
          <View style={{ marginTop: 18 }}>
            {user?.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#6C63FF" />
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
            )}

            {user?.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#6C63FF" />
                <Text style={styles.infoText}>{user.phone}</Text>
              </View>
            )}

            {user?.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#6C63FF" />
                <Text style={styles.infoText}>{user.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menuCard}>
          <MenuItem icon="lock-closed-outline" text="Đổi mật khẩu" onPress={() => navigation.navigate("ChangePassword")} />
          <MenuItem icon="reader-outline" text="Đơn hàng của tôi" />
          <MenuItem icon="location-outline" text="Địa chỉ nhận hàng" />
          <MenuItem icon="notifications-outline" text="Thông báo" />
          <MenuItem icon="help-buoy-outline" text="Trung tâm hỗ trợ" />
          <MenuItem icon="settings-outline" text="Cài đặt" noBorder />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>UTE Book Store v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, text, onPress, noBorder }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.menuItem, noBorder ? { borderBottomWidth: 0 } : null]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={22} color="#6C63FF" />
        <Text style={styles.menuText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    backgroundColor: "#6C63FF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#fff" },

  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  name: { fontSize: 20, fontWeight: "bold", color: "#333" },
  username: { fontSize: 14, color: "#777" },
  editText: { color: "#6C63FF", marginTop: 3, fontWeight: "600" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: { marginLeft: 10, color: "#555", fontSize: 14 },

  menuCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 6,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuText: { fontSize: 16, marginLeft: 12, color: "#333" },

  logoutBtn: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginHorizontal: 40,
    marginTop: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F66",
  },
  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  version: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 25,
    color: "#AAA",
  },
});
