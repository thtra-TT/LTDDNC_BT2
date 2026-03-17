import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

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
  saleBg:      "#FFF1EE",
  green:       "#00897B",
  greenBg:     "#E0F2F1",
  orange:      "#F57C00",
  orangeBg:    "#FFF3E0",
};

// ─── Status steps ─────────────────────────────────────────────────────────────
const ORDER_STATUS_STEPS = [
  { key: "pending",   label: "Đơn hàng mới",    icon: "document-text-outline" },
  { key: "confirmed", label: "Đã xác nhận",      icon: "checkmark-circle-outline" },
  { key: "preparing", label: "Đang chuẩn bị",    icon: "construct-outline" },
  { key: "delivery",  label: "Đang giao hàng",   icon: "bicycle-outline" },
  { key: "success",   label: "Giao thành công",  icon: "bag-check-outline" },
];

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon as any} size={16} color={C.primaryMid} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function OrderDetail() {
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading]     = useState(true);

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const fetchDetail = async () => {
    if (!orderId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res   = await fetch(`${BASE_URL}/api/orders/order-detail/${orderId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      setOrderData(data?.items ? data : null);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [orderId]);

  const checkCanCancel = (createdAt: string) => {
    const diff = (Date.now() - new Date(createdAt).getTime()) / 60000;
    return diff <= 30;
  };

  const handleCancelOrder = async () => {
    Alert.alert("Xác nhận huỷ đơn", "Bạn có chắc chắn muốn huỷ đơn hàng này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Huỷ đơn", style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res   = await fetch(`${BASE_URL}/api/orders/cancel-order/${orderId}`, {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const result = await res.json();
            if (res.ok) {
              Alert.alert("Thành công", "Đơn hàng của bạn đã được huỷ.");
              fetchDetail();
            } else {
              Alert.alert("Lỗi", result.error || "Không thể huỷ đơn hàng");
            }
          } catch {
            Alert.alert("Lỗi", "Kết nối server thất bại");
          }
        },
      },
    ]);
  };

  // ─── Status stepper ──────────────────────────────────────────────────────
  const renderStatusStepper = () => {
    if (orderData.status === "cancelled") {
      return (
        <View style={s.cancelledBox}>
          <View style={s.cancelledIconWrap}>
            <Ionicons name="close-circle-outline" size={32} color={C.sale} />
          </View>
          <Text style={s.cancelledTitle}>Đơn hàng đã bị huỷ</Text>
          <Text style={s.cancelledSub}>Đơn hàng này đã được huỷ thành công.</Text>
        </View>
      );
    }

    const currentIndex = ORDER_STATUS_STEPS.findIndex(s => s.key === orderData.status);

    return (
      <View style={s.stepper}>
        {ORDER_STATUS_STEPS.map((step, index) => {
          const done    = index < currentIndex;
          const active  = index === currentIndex;
          const isLast  = index === ORDER_STATUS_STEPS.length - 1;

          return (
            <View key={step.key} style={s.stepRow}>
              {/* Left column: dot + line */}
              <View style={s.stepLeft}>
                <View style={[
                  s.stepDot,
                  done   && s.stepDotDone,
                  active && s.stepDotActive,
                ]}>
                  {done ? (
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  ) : active ? (
                    <View style={s.stepDotInner} />
                  ) : null}
                </View>
                {!isLast && (
                  <View style={[s.stepLine, (done || active) && s.stepLineDone]} />
                )}
              </View>

              {/* Right column: label */}
              <View style={s.stepRight}>
                <View style={[s.stepLabelWrap, active && s.stepLabelWrapActive]}>
                  <Ionicons
                    name={step.icon as any}
                    size={15}
                    color={active ? C.primaryMid : done ? C.green : C.text3}
                  />
                  <Text style={[
                    s.stepLabel,
                    done   && s.stepLabelDone,
                    active && s.stepLabelActive,
                  ]}>
                    {step.label}
                  </Text>
                  {active && (
                    <View style={s.stepActiveBadge}>
                      <Text style={s.stepActiveBadgeTxt}>Hiện tại</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // ─── Loading / error ──────────────────────────────────────────────────────
  if (loading) return (
    <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />
      <ActivityIndicator size="large" color={C.primaryMid} />
      <Text style={{ color: C.text3, marginTop: 10 }}>Đang tải đơn hàng...</Text>
    </View>
  );

  if (!orderData) return (
    <SafeAreaView style={s.container}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="receipt-outline" size={56} color={C.primaryTint} />
        <Text style={{ color: C.text2, marginTop: 12, fontSize: 16 }}>
          Không tìm thấy dữ liệu đơn hàng.
        </Text>
      </View>
    </SafeAreaView>
  );

  const canCancel = orderData.status === "pending" && checkCanCancel(orderData.created_at);
  const pastCancel = orderData.status === "pending" && !checkCanCancel(orderData.created_at);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerBlob} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={s.headerSub}>#{orderId}</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TRACKING CARD ────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="navigate-outline" title="Theo dõi đơn hàng" />
          {renderStatusStepper()}
        </View>

        {/* ── DELIVERY INFO ────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="location-outline" title="Thông tin giao hàng" />
          <View style={s.infoGrid}>
            <InfoRow label="Người nhận" value={orderData.customer_name || "Chưa cập nhật"} />
            <InfoRow label="Số điện thoại" value={orderData.phone || "N/A"} />
            <InfoRow label="Địa chỉ" value={orderData.address} />
          </View>
        </View>

        {/* ── PRODUCTS ─────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="books-outline" title={`Sản phẩm đã đặt (${orderData.items.length})`} />
          {orderData.items.map((item: any, index: number) => (
            <View
              key={index}
              style={[s.productRow, index === orderData.items.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={s.productNumWrap}>
                <Text style={s.productNum}>{index + 1}</Text>
              </View>
              <View style={s.productInfo}>
                <Text style={s.productName} numberOfLines={2}>
                  {item.title || `Sách mã #${item.book_id}`}
                </Text>
                <View style={s.productMeta}>
                  <Text style={s.productQty}>x{item.quantity}</Text>
                  <Text style={s.productUnit}>
                    {Number(item.price).toLocaleString("vi-VN")}đ / cuốn
                  </Text>
                </View>
              </View>
              <Text style={s.productTotal}>
                {(Number(item.price) * item.quantity).toLocaleString("vi-VN")}đ
              </Text>
            </View>
          ))}
        </View>

        {/* ── SUMMARY ──────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="calculator-outline" title="Tóm tắt thanh toán" />
          <View style={s.summaryBody}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Tạm tính</Text>
              <Text style={s.summaryVal}>{Number(orderData.total).toLocaleString("vi-VN")}đ</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Phí vận chuyển</Text>
              <Text style={[s.summaryVal, { color: C.green }]}>Miễn phí</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryTotalLabel}>Tổng thanh toán</Text>
              <Text style={s.summaryTotalVal}>{Number(orderData.total).toLocaleString("vi-VN")}đ</Text>
            </View>
          </View>
        </View>

        {/* ── CANCEL ───────────────────────────────────────────── */}
        {canCancel && (
          <TouchableOpacity style={s.cancelBtn} onPress={handleCancelOrder} activeOpacity={0.85}>
            <Ionicons name="close-circle-outline" size={18} color={C.sale} />
            <Text style={s.cancelBtnTxt}>Huỷ đơn hàng</Text>
          </TouchableOpacity>
        )}

        {pastCancel && (
          <View style={s.cancelNoteBox}>
            <Ionicons name="information-circle-outline" size={16} color={C.text3} />
            <Text style={s.cancelNoteTxt}>Đã quá 30 phút — không thể huỷ đơn hàng</Text>
          </View>
        )}

        {/* ── REVIEW ───────────────────────────────────────────── */}
        {orderData.status === "success" && (
          <View style={s.card}>
            <SectionHeader icon="star-outline" title="Đánh giá sản phẩm" />
            <View style={s.reviewList}>
              {orderData.items.map((item: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={s.reviewBtn}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("ReviewScreen", {
                      book_id: item.book_id,
                      order_id: orderId,
                    })
                  }
                >
                  <Text style={s.reviewBtnTxt} numberOfLines={1}>
                    ✍️  {item.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={C.primaryMid} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Header
  header: {
    backgroundColor: C.primaryMid,
    flexDirection: "row", alignItems: "center",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16, paddingHorizontal: 14,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerBlob: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)", top: -50, right: -30,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#FFF" },
  headerSub:   { fontSize: 12, color: "rgba(255,255,255,0.70)", marginTop: 2 },

  scroll: { padding: 16, gap: 12 },

  // ── Card
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 18,
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
    gap: 14,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: C.text1 },

  // ── Info
  infoGrid: { gap: 10 },
  infoRow:  { flexDirection: "row", alignItems: "flex-start" },
  infoLabel: { width: 110, fontSize: 13, color: C.text3, fontWeight: "500" },
  infoValue: { flex: 1, fontSize: 13, color: C.text1, fontWeight: "600" },

  // ── Stepper
  stepper: { gap: 0, paddingLeft: 2 },
  stepRow: { flexDirection: "row", minHeight: 52 },
  stepLeft: { alignItems: "center", width: 28, marginRight: 12 },
  stepDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#E8EFF8",
    borderWidth: 2, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
  },
  stepDotDone: {
    backgroundColor: C.green, borderColor: C.green,
  },
  stepDotActive: {
    backgroundColor: C.primaryMid, borderColor: C.primaryMid,
  },
  stepDotInner: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#FFF",
  },
  stepLine: {
    flex: 1, width: 2, backgroundColor: C.border,
    marginVertical: 3, borderRadius: 2,
  },
  stepLineDone: { backgroundColor: C.green },
  stepRight: { flex: 1, paddingBottom: 12, justifyContent: "flex-start" },
  stepLabelWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 2,
  },
  stepLabelWrapActive: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 12, marginRight: 8,
  },
  stepLabel:       { fontSize: 14, color: C.text3 },
  stepLabelDone:   { color: C.green, fontWeight: "600" },
  stepLabelActive: { color: C.primaryMid, fontWeight: "700" },
  stepActiveBadge: {
    backgroundColor: C.primaryMid, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  stepActiveBadgeTxt: { color: "#FFF", fontSize: 10, fontWeight: "700" },

  // cancelled
  cancelledBox: {
    alignItems: "center", paddingVertical: 16,
    backgroundColor: C.saleBg, borderRadius: 16, gap: 6,
  },
  cancelledIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#FFEBEE",
    justifyContent: "center", alignItems: "center",
  },
  cancelledTitle: { fontSize: 16, fontWeight: "800", color: C.sale },
  cancelledSub:   { fontSize: 13, color: "#E57373" },

  // ── Products
  productRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1, borderColor: C.border,
  },
  productNumWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  productNum:  { fontSize: 12, fontWeight: "800", color: C.primaryMid },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "600", color: C.text1, marginBottom: 4 },
  productMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  productQty: {
    backgroundColor: C.primarySoft, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
    fontSize: 12, fontWeight: "700", color: C.primaryMid,
  },
  productUnit: { fontSize: 12, color: C.text3 },
  productTotal: { fontSize: 14, fontWeight: "800", color: C.text1 },

  // ── Summary
  summaryBody: { gap: 10 },
  summaryRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, color: C.text2 },
  summaryVal:   { fontSize: 14, color: C.text1, fontWeight: "600" },
  summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  summaryTotalLabel: { fontSize: 16, fontWeight: "800", color: C.text1 },
  summaryTotalVal:   { fontSize: 20, fontWeight: "900", color: C.sale },

  // ── Cancel
  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.sale,
    paddingVertical: 15,
    elevation: 1,
    shadowColor: C.sale, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 6,
  },
  cancelBtnTxt: { color: C.sale, fontWeight: "800", fontSize: 15 },
  cancelNoteBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10,
  },
  cancelNoteTxt: { fontSize: 13, color: C.text3, fontStyle: "italic" },

  // ── Review
  reviewList: { gap: 10 },
  reviewBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.primarySoft, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.primaryTint,
  },
  reviewBtnTxt: { flex: 1, fontSize: 14, color: C.primaryMid, fontWeight: "600" },
});