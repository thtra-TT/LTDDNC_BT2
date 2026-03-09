

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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// --- PHẦN THÊM MỚI 1: KHAI BÁO CÁC BƯỚC TRẠNG THÁI ---
const ORDER_STATUS_STEPS = [
  { key: 'pending', label: 'Đơn hàng mới', icon: '' },
  { key: 'confirmed', label: 'Đã xác nhận', icon: '' },
  { key: 'preparing', label: 'Đang chuẩn bị', icon: '' },
  { key: 'delivery', label: 'Đang giao hàng', icon: '' },
  { key: 'success', label: 'Giao thành công', icon: '' },
];

export default function OrderDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params || {};

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!orderId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/order-detail/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (data && data.items) {
        setOrderData(data);
      } else {
        setOrderData(null);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  // --- PHẦN THÊM MỚI 2: HÀM RENDER THANH TRẠNG THÁI ---
  const renderStatusStepper = () => {
    // Nếu bị huỷ thì hiện thông báo riêng
    if (orderData.status === 'cancelled') {
      return (
        <View style={styles.cancelledBox}>
          <Text style={styles.cancelledText}>🚫 Đơn hàng này đã bị huỷ</Text>
        </View>
      );
    }

    const currentIndex = ORDER_STATUS_STEPS.findIndex(s => s.key === orderData.status);

    return (
      <View style={styles.stepperContainer}>
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isLast = index === ORDER_STATUS_STEPS.length - 1;

          return (
            <View key={step.key} style={styles.stepItem}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepDot, isCompleted && styles.stepDotActive]} />
                {!isLast && <View style={[styles.stepLine, isCompleted && styles.stepLineActive]} />}
              </View>
              <View style={styles.stepRight}>
                <Text style={[styles.stepLabel, isCompleted && styles.stepLabelActive]}>
                  {step.icon} {step.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const checkCanCancel = (createdAt: string) => {
    const orderTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (now - orderTime) / (1000 * 60);
    return diffInMinutes <= 30;
  };

  const handleCancelOrder = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn huỷ đơn hàng này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Huỷ đơn",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/api/orders/cancel-order/${orderId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const result = await res.json();

            if (res.ok) {
              Alert.alert("Thành công", "Đơn hàng của bạn đã được huỷ.");
              fetchDetail();
            } else {
              Alert.alert("Lỗi", result.error || "Không thể huỷ đơn hàng");
            }
          } catch (e) {
            Alert.alert("Lỗi", "Kết nối server thất bại");
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!orderData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.noData}>Không tìm thấy dữ liệu đơn hàng.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArea}>
          <Text style={styles.backBtn}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng #{orderId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* --- PHẦN THÊM MỚI 3: HIỂN THỊ THANH TRẠNG THÁI --- */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Theo dõi đơn hàng</Text>
          {renderStatusStepper()}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Người nhận:</Text>
            <Text style={styles.value}>{orderData.customer_name || "Chưa cập nhật"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{orderData.phone || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>{orderData.address}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {orderData.items.map((item: any, index: number) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.title || `Sách mã #${item.book_id}`}
                </Text>
                <Text style={styles.productQty}>Số lượng: x{item.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>
                {(Number(item.price) * item.quantity).toLocaleString()}đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>{Number(orderData.total).toLocaleString()}đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>0đ</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>{Number(orderData.total).toLocaleString()}đ</Text>
          </View>
          <View style={styles.statusRow}>
             <Text style={styles.statusBadge}>Trạng thái: {orderData.status?.toUpperCase()}</Text>
          </View>
        </View>

        {orderData.status === 'pending' && checkCanCancel(orderData.created_at) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelButtonText}>Huỷ đơn hàng</Text>
          </TouchableOpacity>
        )}

        {orderData.status === 'pending' && !checkCanCancel(orderData.created_at) && (
          <Text style={styles.cancelNote}>* Đã quá thời gian huỷ đơn (30 phút)</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", elevation: 2 },
  backArea: { paddingRight: 10 },
  backBtn: { fontSize: 16, color: "#6C63FF", fontWeight: "bold" },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  container: { padding: 12 },
  sectionCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 12, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#6C63FF", marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", paddingBottom: 5 },
  infoRow: { flexDirection: "row", marginBottom: 6 },
  label: { flex: 1, color: "#666", fontSize: 14 },
  value: { flex: 2, color: "#333", fontWeight: "500", fontSize: 14 },
  productRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  productInfo: { flex: 2 },
  productName: { fontSize: 15, fontWeight: "500", color: "#333" },
  productQty: { color: "#888", marginTop: 4, fontSize: 13 },
  productPrice: { flex: 1, textAlign: "right", fontWeight: "bold", color: "#333" },
  summaryCard: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { color: "#666" },
  summaryValue: { color: "#333" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#e74c3c" },
  statusRow: { marginTop: 15, alignItems: 'center' },
  statusBadge: { color: '#f39c12', fontWeight: 'bold', backgroundColor: '#fef5e7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  cancelButton: { backgroundColor: "#fff", padding: 15, borderRadius: 10, borderWidth: 1, borderColor: "#e74c3c", alignItems: "center", marginBottom: 20 },
  cancelButtonText: { color: "#e74c3c", fontWeight: "bold", fontSize: 16 },
  cancelNote: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginBottom: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  noData: { textAlign: 'center', marginTop: 50, fontSize: 16, color: "#888" },

  // --- PHẦN THÊM MỚI 4: STYLES CHO STEPPER ---
  stepperContainer: { marginTop: 10, paddingLeft: 5 },
  stepItem: { flexDirection: 'row', minHeight: 50 },
  stepLeft: { alignItems: 'center', marginRight: 15 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E0E0E0' },
  stepDotActive: { backgroundColor: '#27ae60' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginVertical: 2 },
  stepLineActive: { backgroundColor: '#27ae60' },
  stepRight: { flex: 1, paddingTop: -2 },
  stepLabel: { fontSize: 14, color: '#999' },
  stepLabelActive: { color: '#27ae60', fontWeight: 'bold' },
  cancelledBox: { backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelledText: { color: '#e74c3c', fontWeight: 'bold' }
});