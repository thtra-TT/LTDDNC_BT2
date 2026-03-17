import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import { RefreshControl } from "react-native";

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

// ─── Palette — light blue ─────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",   // deep blue
  primaryMid:  "#1E88E5",   // medium blue
  primaryLight:"#42A5F5",   // sky blue
  primarySoft: "#E3F2FD",   // very light blue
  primaryTint: "#BBDEFB",   // tint for borders
  bg:          "#F0F6FF",   // blue-tinted page bg
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  text1:       "#0D1B3E",   // deep navy
  text2:       "#4A5980",
  text3:       "#9AA8C8",
  gold:        "#FFB300",
};

// ─── Stat bubble ──────────────────────────────────────────────────────────────
function StatBubble({ value, label, icon }) {
  return (
    <View style={styles.statBubble}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Menu item ────────────────────────────────────────────────────────────────
function MenuItem({ icon, text, onPress, noBorder, badge }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.menuItem, noBorder && { borderBottomWidth: 0 }]}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={icon} size={19} color={C.primaryMid} />
        </View>
        <Text style={styles.menuText}>{text}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{badge}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={C.text3} />
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, loadUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  console.log("USER DATA FROM CONTEXT:", user);
  console.log("AVATAR URL:", `${BASE_URL}/uploads/${user?.avatar}`);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const avatarUri = user?.avatar
    ? `${BASE_URL}/uploads/${user.avatar}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primaryMid]}
            tintColor={C.primaryMid}
          />
        }
      >
        {/* ── HEADER HERO ──────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* decorative circles */}
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />
          <View style={styles.heroBubble3} />

          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>Tài khoản</Text>
            <TouchableOpacity style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Avatar + name block */}
          <View style={styles.heroProfile}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: avatarUri }}
                onError={(err) => console.log("🔥 IMAGE ERROR:", err.nativeEvent.error)}
                style={styles.avatar}
              />
              <View style={styles.avatarOnline} />
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{user?.username || "No Name"}</Text>
              <Text style={styles.heroUsername}>@{user?.username}</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate("EditInfo")}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil-outline" size={13} color={C.primaryMid} />
                <Text style={styles.editBtnTxt}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats row */}
          {user?.reward_points !== undefined && (
            <View style={styles.statsRow}>
              <StatBubble value={user.reward_points} label="Điểm" icon="⭐" />
              <View style={styles.statsDivider} />
              <StatBubble value={"0"} label="Đơn hàng" icon="📦" />
              <View style={styles.statsDivider} />
              <StatBubble value={"0"} label="Yêu thích" icon="❤️" />
            </View>
          )}
        </View>

        {/* ── CONTACT CARD ─────────────────────────────────────────── */}
        <View style={styles.contactCard}>
          <Text style={styles.cardLabel}>Thông tin liên hệ</Text>

          {user?.email && (
            <View style={styles.contactRow}>
              <View style={styles.contactIconWrap}>
                <Ionicons name="mail-outline" size={17} color={C.primaryMid} />
              </View>
              <Text style={styles.contactTxt}>{user.email}</Text>
            </View>
          )}

          {user?.phone && (
            <View style={styles.contactRow}>
              <View style={styles.contactIconWrap}>
                <Ionicons name="call-outline" size={17} color={C.primaryMid} />
              </View>
              <Text style={styles.contactTxt}>{user.phone}</Text>
            </View>
          )}

          {user?.address && (
            <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
              <View style={styles.contactIconWrap}>
                <Ionicons name="location-outline" size={17} color={C.primaryMid} />
              </View>
              <Text style={styles.contactTxt}>{user.address}</Text>
            </View>
          )}
        </View>

        {/* ── MENU CARDS ───────────────────────────────────────────── */}
        <View style={styles.menuCard}>
          <Text style={styles.cardLabel}>Quản lý tài khoản</Text>
          <MenuItem
            icon="bag-handle-outline"
            text="Giỏ hàng của tôi"
            onPress={() => navigation.navigate("Cart")}
          />
          <MenuItem
            icon="receipt-outline"
            text="Đơn hàng của tôi"
            onPress={() => navigation.navigate("OrderHistory")}
          />
          <MenuItem
            icon="location-outline"
            text="Địa chỉ nhận hàng"
            onPress={() => navigation.navigate("Address")}
            noBorder
          />
        </View>

        <View style={[styles.menuCard, { marginTop: 12 }]}>
          <Text style={styles.cardLabel}>Cài đặt & Hỗ trợ</Text>
          <MenuItem
            icon="lock-closed-outline"
            text="Đổi mật khẩu"
            onPress={() => navigation.navigate("ChangePassword")}
          />
          <MenuItem
            icon="notifications-outline"
            text="Thông báo"
          />
          <MenuItem
            icon="help-buoy-outline"
            text="Trung tâm hỗ trợ"
          />
          <MenuItem
            icon="settings-outline"
            text="Cài đặt"
            noBorder
          />
        </View>

        {/* ── LOGOUT ───────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={C.primaryMid} />
          <Text style={styles.logoutTxt}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>UTE Book Store v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Hero
  hero: {
    backgroundColor: C.primaryMid,
    paddingTop: (StatusBar.currentHeight || 44) + 4,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  heroBubble1: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -60, right: -50,
  },
  heroBubble2: {
    position: "absolute", width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
    bottom: -30, left: 10,
  },
  heroBubble3: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: 30, left: "45%",
  },

  heroTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.20)",
    justifyContent: "center", alignItems: "center",
  },

  heroProfile: {
    flexDirection: "row", alignItems: "center",
    gap: 16, marginBottom: 20,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.75)",
  },
  avatarOnline: {
    position: "absolute", bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#4ADE80",
    borderWidth: 2, borderColor: C.primaryMid,
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: "800", color: "#FFF", marginBottom: 2 },
  heroUsername: { fontSize: 13, color: "rgba(255,255,255,0.72)", marginBottom: 8 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  editBtnTxt: { fontSize: 12, color: C.primaryMid, fontWeight: "700" },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18, paddingVertical: 12, paddingHorizontal: 8,
  },
  statBubble: { flex: 1, alignItems: "center", gap: 2 },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  statsDivider: {
    width: 1, backgroundColor: "rgba(255,255,255,0.25)", marginVertical: 4,
  },

  // ── Cards
  contactCard: {
    backgroundColor: C.surface,
    marginHorizontal: 16, marginTop: 18,
    borderRadius: 18, padding: 18,
    elevation: 2,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  cardLabel: {
    fontSize: 12, fontWeight: "700", color: C.text3,
    textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1, borderColor: C.border,
  },
  contactIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  contactTxt: { fontSize: 14, color: C.text1, flex: 1 },

  // ── Menu
  menuCard: {
    backgroundColor: C.surface,
    marginHorizontal: 16, marginTop: 18,
    borderRadius: 18, paddingTop: 18,
    paddingHorizontal: 16, paddingBottom: 4,
    elevation: 2,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 14,
    borderBottomWidth: 1, borderColor: C.border,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  menuText: { fontSize: 15, color: C.text1, fontWeight: "500" },
  badge: {
    backgroundColor: C.primaryMid, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeTxt: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  // ── Logout
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 40, marginTop: 24,
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.primaryMid,
    backgroundColor: C.primarySoft,
  },
  logoutTxt: { fontSize: 15, fontWeight: "700", color: C.primaryMid },

  version: {
    textAlign: "center", marginTop: 18, marginBottom: 10,
    fontSize: 12, color: C.text3,
  },
});