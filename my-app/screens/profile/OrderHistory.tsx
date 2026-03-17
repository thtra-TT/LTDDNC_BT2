import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "../../types/order";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",
  primaryMid:  "#1E88E5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  bg:          "#F0F6FF",
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  text1:       "#0D1B3E",
  text2:       "#4A5980",
  text3:       "#9AA8C8",
  sale:        "#E53935",
  green:       "#00897B",
  greenBg:     "#E0F2F1",
  orange:      "#F57C00",
  orangeBg:    "#FFF3E0",
  purple:      "#6A1B9A",
  purpleBg:    "#F3E5F5",
  grey:        "#546E7A",
  greyBg:      "#ECEFF1",
};

// ─── Status config ────────────────────────────────────────────────────────────
function getStatusConfig(status: string) {
  const map: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending:    { label: "Chờ xác nhận", color: C.orange,  bg: C.orangeBg,  icon: "time-outline" },
    processing: { label: "Đang xử lý",   color: C.primaryMid, bg: C.primarySoft, icon: "sync-outline" },
    shipping:   { label: "Đang giao",    color: C.purple,  bg: C.purpleBg,  icon: "bicycle-outline" },
    completed:  { label: "Hoàn thành",   color: C.green,   bg: C.greenBg,   icon: "checkmark-circle-outline" },
    cancelled:  { label: "Đã hủy",       color: C.sale,    bg: "#FFF1EE",   icon: "close-circle-outline" },
  };
  return map[status] ?? { label: status.toUpperCase(), color: C.grey, bg: C.greyBg, icon: "ellipse-outline" };
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = getStatusConfig(status);
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
      <Text style={[s.badgeTxt, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── Tab filter strip ─────────────────────────────────────────────────────────
const TABS = [
  { key: null,        label: "Tất cả" },
  { key: "pending",   label: "Chờ xác nhận" },
  { key: "shipping",  label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

// ─── Order card ───────────────────────────────────────────────────────────────
function OrderCard({ item, onPress }: { item: Order; onPress: () => void }) {
  const cfg  = getStatusConfig(item.status);
  const date = new Date(item.created_at);
  const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      {/* Card top: order id + status */}
      <View style={s.cardTop}>
        <View style={s.cardTopLeft}>
          <View style={s.orderNumWrap}>
            <Ionicons name="receipt-outline" size={14} color={C.primaryMid} />
            <Text style={s.orderNum}>Đơn #{item.id}</Text>
          </View>
          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={C.text3} />
            <Text style={s.dateTxt}>{dateStr}</Text>
            <Text style={s.dateDot}>·</Text>
            <Ionicons name="time-outline" size={12} color={C.text3} />
            <Text style={s.dateTxt}>{timeStr}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {/* Divider */}
      <View style={s.cardDivider} />

      {/* Card bottom: total + chevron */}
      <View style={s.cardBottom}>
        <View>
          <Text style={s.totalLabel}>Tổng thanh toán</Text>
          <Text style={s.totalPrice}>{Number(item.total).toLocaleString("vi-VN")}đ</Text>
        </View>
        <View style={s.detailBtn}>
          <Text style={s.detailBtnTxt}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={15} color={C.primaryMid} />
        </View>
      </View>

      {/* Left accent bar */}
      <View style={[s.accentBar, { backgroundColor: cfg.color }]} />
    </TouchableOpacity>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function OrderHistory() {
  const navigation = useNavigation<any>();
  const { user }   = useAuth();

  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res   = await fetch(`${BASE_URL}/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, [user?.id]));

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  // ─── Filter ──────────────────────────────────────────────────────────────
  const filtered = activeTab ? orders.filter(o => o.status === activeTab) : orders;

  // ─── Stats ───────────────────────────────────────────────────────────────
  const completedCount  = orders.filter(o => o.status === "completed").length;
  const pendingCount    = orders.filter(o => o.status === "pending" || o.status === "shipping").length;
  const totalSpent      = orders
    .filter(o => o.status === "completed")
    .reduce((s, o) => s + Number(o.total), 0);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />
        <ActivityIndicator size="large" color={C.primaryMid} />
        <Text style={{ color: C.text3, marginTop: 10, fontSize: 14 }}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerBlob1} />
        <View style={s.headerBlob2} />

        <View style={s.headerTop}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Lịch sử đơn hàng</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Stats strip */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statVal}>{orders.length}</Text>
            <Text style={s.statLbl}>Tổng đơn</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{completedCount}</Text>
            <Text style={s.statLbl}>Hoàn thành</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal}>{pendingCount}</Text>
            <Text style={s.statLbl}>Đang xử lý</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statVal} numberOfLines={1}>
              {totalSpent > 0 ? (totalSpent / 1000000).toFixed(1) + "M" : "0đ"}
            </Text>
            <Text style={s.statLbl}>Đã chi</Text>
          </View>
        </View>
      </View>

      {/* ── TAB FILTER ───────────────────────────────────────────── */}
      <View style={s.tabsWrap}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => String(t.key)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
          renderItem={({ item: tab }) => {
            const active = activeTab === tab.key;
            const count  = tab.key ? orders.filter(o => o.status === tab.key).length : orders.length;
            return (
              <TouchableOpacity
                style={[s.tab, active && s.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabTxt, active && s.tabTxtActive]}>{tab.label}</Text>
                {count > 0 && (
                  <View style={[s.tabBadge, active && s.tabBadgeActive]}>
                    <Text style={[s.tabBadgeTxt, active && s.tabBadgeTxtActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── LIST ─────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primaryMid]}
            tintColor={C.primaryMid}
          />
        }
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="receipt-outline" size={48} color={C.primaryTint} />
            </View>
            <Text style={s.emptyTitle}>Không có đơn hàng</Text>
            <Text style={s.emptySub}>
              {activeTab ? "Không có đơn hàng nào trong trạng thái này." : "Bạn chưa có đơn hàng nào."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Header
  header: {
    backgroundColor: C.primaryMid,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerBlob1: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)", top: -60, right: -40,
  },
  headerBlob2: {
    position: "absolute", width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)", bottom: -20, left: "35%",
  },
  headerTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 18,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18, paddingVertical: 12, paddingHorizontal: 6,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal:  { fontSize: 18, fontWeight: "900", color: "#FFF" },
  statLbl:  { fontSize: 10, color: "rgba(255,255,255,0.72)", fontWeight: "500" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)", marginVertical: 4 },

  // ── Tabs
  tabsWrap: {
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderColor: C.border,
  },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg,
  },
  tabActive: {
    backgroundColor: C.primarySoft,
    borderColor: C.primaryMid,
  },
  tabTxt:       { fontSize: 13, fontWeight: "600", color: C.text2 },
  tabTxtActive: { color: C.primaryMid, fontWeight: "700" },
  tabBadge: {
    backgroundColor: C.border, borderRadius: 10,
    minWidth: 20, height: 20, paddingHorizontal: 5,
    justifyContent: "center", alignItems: "center",
  },
  tabBadgeActive:    { backgroundColor: C.primaryMid },
  tabBadgeTxt:       { fontSize: 11, fontWeight: "700", color: C.text3 },
  tabBadgeTxtActive: { color: "#FFF" },

  // ── List
  listContent: { padding: 16, gap: 12, paddingBottom: 30 },

  // ── Order card
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09, shadowRadius: 8,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
    borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
  },

  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingLeft: 8,
  },
  cardTopLeft: { gap: 5 },
  orderNumWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  orderNum:     { fontSize: 15, fontWeight: "800", color: C.text1 },
  dateRow:      { flexDirection: "row", alignItems: "center", gap: 4 },
  dateTxt:      { fontSize: 12, color: C.text3 },
  dateDot:      { fontSize: 12, color: C.text3 },

  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTxt: { fontSize: 12, fontWeight: "700" },

  cardDivider: {
    height: 1, backgroundColor: C.border,
    marginVertical: 12, marginLeft: 8,
  },

  cardBottom: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingLeft: 8,
  },
  totalLabel: { fontSize: 11, color: C.text3, marginBottom: 3 },
  totalPrice: { fontSize: 18, fontWeight: "900", color: C.sale },
  detailBtn: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
  },
  detailBtnTxt: { fontSize: 13, fontWeight: "700", color: C.primaryMid },

  // ── Empty
  emptyBox: {
    alignItems: "center", marginTop: 60, paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: C.text1, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 21 },
});