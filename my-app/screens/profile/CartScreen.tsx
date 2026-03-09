import React, { useState, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, ActivityIndicator, Alert
} from "react-native";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

export default function CartScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // Lưu ID các item được chọn
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCart = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data);
    } catch (error) {
      console.log("❌ Lỗi tải giỏ hàng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCart(); }, [user?.id]));

  // Logic chọn/bỏ chọn sản phẩm
  const toggleSelect = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Logic chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const updateQuantity = async (cartItemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/cart/update-quantity`,
        { cartItemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(prev => prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQty } : item
      ));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    }
  };

  const removeItem = async (cartItemId: number) => {
    Alert.alert("Xác nhận", "Xóa sản phẩm này?", [
      { text: "Hủy" },
      { text: "Xóa", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${BASE_URL}/api/cart/remove/${cartItemId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));
            setSelectedItems(prev => prev.filter(id => id !== cartItemId));
          } catch (error) { Alert.alert("Lỗi", "Không thể xóa"); }
      }}
    ]);
  };

  // Tính tổng tiền dựa trên các sản phẩm đã CHỌN
  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Chuyển sang màn hình Checkout
  const handleGoToCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    // 1. Lấy danh sách các đối tượng item đầy đủ từ mảng ID đã chọn
    const selectedFullItems = cartItems.filter(item => selectedItems.includes(item.id));

    // 2. Chuyển đổi (map) lại cấu trúc dữ liệu để khớp với Controller Backend yêu cầu
    const itemsToPay = selectedFullItems.map(item => ({
      cart_item_id: item.id,      // Gán 'id' của giỏ hàng vào 'cart_item_id' để Backend xóa được giỏ
      book_id: item.book_id,    // ID của sách để Backend trừ kho
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      cover_image: item.cover_image
    }));

    // 3. Log thử để kiểm tra cấu trúc trước khi đi (Bạn có thể xóa dòng này sau khi chạy tốt)
    console.log("Dữ liệu chuẩn bị gửi sang Checkout:", itemsToPay);

    navigation.navigate("Checkout", {
      selectedItems: itemsToPay,
      totalPrice: calculateTotal()
    });
  };

  const renderRightActions = (id: number) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => removeItem(id)}>
      <Ionicons name="trash-outline" size={28} color="#fff" />
      <Text style={styles.deleteActionText}>Xóa</Text>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Giỏ hàng ({cartItems.length})</Text>
          <TouchableOpacity onPress={() => toggleSelectAll()}>
             <Text style={{color: '#fff', fontWeight: 'bold'}}>
               {selectedItems.length === cartItems.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
             </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCart} />}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={80} color="#DDD" />
              <Text style={{ color: "#AAA", marginTop: 10 }}>Giỏ hàng rỗng</Text>
            </View>
          ) : (
            cartItems.map((item) => (
              <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
                <View style={[styles.cartCard, item.stock <= 0 && styles.disabledCard]}>
                  {/* CHECKBOX */}
                  <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox}>
                    <Ionicons
                      name={selectedItems.includes(item.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color={selectedItems.includes(item.id) ? "#6C63FF" : "#DDD"}
                    />
                  </TouchableOpacity>

                  <Image
                    source={{ uri: item.cover_image?.startsWith('http') ? item.cover_image : `${BASE_URL}/uploads/${item.cover_image}` }}
                    style={styles.bookImage}
                  />

                  <View style={styles.infoContainer}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.price}>{Number(item.price).toLocaleString()}đ</Text>

                    <View style={styles.quantityRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity, -1)}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Text style={[styles.qtyBtnText, item.quantity >= item.stock && { color: '#CCC' }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Tổng cộng ({selectedItems.length}):</Text>
            <Text style={styles.totalPrice}>{calculateTotal().toLocaleString()}đ</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, selectedItems.length === 0 && {backgroundColor: '#CCC'}]}
            onPress={handleGoToCheckout}
          >
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
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
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  cartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: { marginRight: 10 },
  bookImage: { width: 60, height: 80, borderRadius: 8 },
  infoContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: "bold", color: "#333" },
  price: { color: "#6C63FF", fontWeight: "bold", marginTop: 4 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
    alignSelf: 'flex-start'
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 2 },
  qtyBtnText: { fontSize: 18, color: "#6C63FF", fontWeight: 'bold' },
  qtyText: { marginHorizontal: 10, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 20,
  },
  totalPrice: { fontSize: 20, fontWeight: "bold", color: "#E53935" },
  checkoutBtn: { backgroundColor: "#6C63FF", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
  checkoutText: { color: "#fff", fontWeight: "bold" },
  deleteAction: { backgroundColor: '#FF5252', justifyContent: 'center', alignItems: 'center', width: 80, height: 100, borderRadius: 14 },
  deleteActionText: { color: '#fff', fontSize: 12, marginTop: 4 },
  emptyCart: { alignItems: "center", marginTop: 100 },
  disabledCard: { opacity: 0.5 }
});