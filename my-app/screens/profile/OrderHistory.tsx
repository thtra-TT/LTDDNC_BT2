import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Order } from "../../types/order"; // Nhớ import interface đã tạo

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function OrderHistory() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
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

  // Cập nhật lại dữ liệu mỗi khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Mã đơn: #{item.id}</Text>
        <Text style={[styles.status, { color: item.status === 'completed' ? '#2ecc71' : '#f39c12' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.totalText}>
        Tổng tiền: <Text style={styles.price}>{Number(item.total).toLocaleString()}đ</Text>
      </Text>
      <Text style={styles.dateText}>
        Ngày đặt: {new Date(item.created_at).toLocaleString('vi-VN')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.headerTitle}>Lịch sử mua hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", padding: 16, textAlign: "center", borderBottomWidth: 1, borderBottomColor: "#eee" },
  listContent: { padding: 16 },
  orderCard: { backgroundColor: "#f9f9f9", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#eee" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  orderId: { fontWeight: "bold", fontSize: 16, color: "#333" },
  status: { fontWeight: "bold", fontSize: 14 },
  totalText: { fontSize: 15, color: "#555", marginVertical: 4 },
  price: { color: "#e74c3c", fontWeight: "bold" },
  dateText: { fontSize: 13, color: "#888" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" }
});