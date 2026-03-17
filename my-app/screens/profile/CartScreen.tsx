import React, { useState, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, ActivityIndicator, Alert,
  StatusBar, Platform,
} from "react-native";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = Constants.expoConfig.extra.BASE_URL;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",
  primaryMid:  "#1E88E5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  bg:          "#F0F6FF",
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  sale:        "#E53935",
  text1:       "#0D1B3E",
  text2:       "#4A5980",
  text3:       "#9AA8C8",
};

export default function CartScreen() {
  const { user }     = useAuth();
  const navigation   = useNavigation<any>();
  const [cartItems, setCartItems]       = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  // ==========================
  // API LOGIC (all unchanged)
  // ==========================
  const fetchCart = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${BASE_URL}/api/cart/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const toggleSelect = (id: number) =>
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelectedItems(
      selectedItems.length === cartItems.length ? [] : cartItems.map(i => i.id)
    );

  const updateQuantity = async (cartItemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/cart/update-quantity`,
        { cartItemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(prev =>
        prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item)
      );
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    }
  };

  const removeItem = async (cartItemId: number) => {
    Alert.alert("Xác nhận", "Xóa sản phẩm này?", [
      { text: "Hủy" },
      {
        text: "Xóa", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`${BASE_URL}/api/cart/remove/${cartItemId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(prev => prev.filter(i => i.id !== cartItemId));
            setSelectedItems(prev => prev.filter(id => id !== cartItemId));
          } catch { Alert.alert("Lỗi", "Không thể xóa"); }
        },
      },
    ]);
  };

  const calculateTotal = () =>
    cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleGoToCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    const selectedFullItems = cartItems.filter(item => selectedItems.includes(item.id));
    const itemsToPay = selectedFullItems.map(item => ({
      cart_item_id: item.id,
      book_id:      item.book_id,
      title:        item.title,
      price:        item.price,
      quantity:     item.quantity,
      cover_image:  item.cover_image,
    }));
    console.log("Dữ liệu chuẩn bị gửi sang Checkout:", itemsToPay);
    navigation.navigate("Checkout", {
      selectedItems: itemsToPay,
      totalPrice: calculateTotal(),
    });
  };

  // ─── Swipe-to-delete action ───────────────────────────────────────────────
  const renderRightActions = (id: number) => (
    <TouchableOpacity style={s.deleteAction} onPress={() => removeItem(id)}>
      <Ionicons name="trash-outline" size={24} color="#fff" />
      <Text style={s.deleteActionTxt}>Xóa</Text>
    </TouchableOpacity>
  );

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={C.primaryMid} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

        {/* ── HEADER ───────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerBlob} />
          <View style={s.headerTop}>
            <View>
              <Text style={s.headerTitle}>Giỏ hàng</Text>
              <Text style={s.headerSub}>{cartItems.length} sản phẩm</Text>
            </View>
            <TouchableOpacity style={s.selectAllBtn} onPress={toggleSelectAll}>
              <Ionicons
                name={allSelected ? "checkbox" : "square-outline"}
                size={16}
                color={allSelected ? C.primaryMid : "rgba(255,255,255,0.8)"}
              />
              <Text style={s.selectAllTxt}>
                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CART ITEMS ───────────────────────────────────────────── */}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchCart}
              colors={[C.primaryMid]}
              tintColor={C.primaryMid}
            />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
        >
          {cartItems.length === 0 ? (
            <View style={s.emptyBox}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="cart-outline" size={52} color={C.primaryTint} />
              </View>
              <Text style={s.emptyTitle}>Giỏ hàng trống</Text>
              <Text style={s.emptySub}>Hãy thêm sách yêu thích của bạn!</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={s.emptyBtnTxt}>Khám phá sách</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cartItems.map(item => (
              <Swipeable
                key={item.id}
                renderRightActions={() => renderRightActions(item.id)}
                overshootRight={false}
              >
                <View style={[s.card, item.stock <= 0 && s.cardDisabled]}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => toggleSelect(item.id)}
                    style={s.checkboxWrap}
                  >
                    <View style={[
                      s.checkbox,
                      selectedItems.includes(item.id) && s.checkboxActive,
                    ]}>
                      {selectedItems.includes(item.id) && (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Cover */}
                  <Image
                    source={{
                      uri: item.cover_image?.startsWith("http")
                        ? item.cover_image
                        : `${BASE_URL}/uploads/${item.cover_image}`,
                    }}
                    style={s.cover}
                  />

                  {/* Info */}
                  <View style={s.info}>
                    <Text style={s.bookTitle} numberOfLines={2}>{item.title}</Text>

                    {item.stock <= 0 && (
                      <View style={s.outOfStockBadge}>
                        <Text style={s.outOfStockTxt}>Hết hàng</Text>
                      </View>
                    )}

                    <Text style={s.bookPrice}>
                      {Number(item.price).toLocaleString("vi-VN")}đ
                    </Text>

                    {/* Qty control */}
                    <View style={s.qtyRow}>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity, -1)}
                      >
                        <Text style={s.qtyBtnTxt}>−</Text>
                      </TouchableOpacity>
                      <Text style={s.qtyVal}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[s.qtyBtn, item.quantity >= item.stock && s.qtyBtnDisabled]}
                        onPress={() => updateQuantity(item.id, item.quantity, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Text style={[s.qtyBtnTxt, item.quantity >= item.stock && { color: C.text3 }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Subtotal */}
                  <View style={s.subtotal}>
                    <Text style={s.subtotalTxt}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </Text>
                  </View>
                </View>
              </Swipeable>
            ))
          )}
        </ScrollView>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        {cartItems.length > 0 && (
          <View style={s.footer}>
            {/* Summary row */}
            <View style={s.footerSummary}>
              <Text style={s.footerLabel}>
                Đã chọn {selectedItems.length}/{cartItems.length} sản phẩm
              </Text>
              <View style={s.footerPriceRow}>
                <Text style={s.footerPriceLabel}>Tổng tiền:</Text>
                <Text style={s.footerPrice}>
                  {calculateTotal().toLocaleString("vi-VN")}đ
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                s.checkoutBtn,
                selectedItems.length === 0 && s.checkoutBtnDisabled,
              ]}
              onPress={handleGoToCheckout}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={18} color="#FFF" />
              <Text style={s.checkoutTxt}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Header
  header: {
    backgroundColor: C.primaryMid,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerBlob: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)", top: -60, right: -30,
  },
  headerTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
  },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  selectAllBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  selectAllTxt: { fontSize: 13, color: "#FFF", fontWeight: "600" },

  // ── Empty state
  emptyBox: {
    alignItems: "center", marginTop: 80, paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: C.text1, marginBottom: 6 },
  emptySub:   { fontSize: 14, color: C.text3, textAlign: "center", marginBottom: 24 },
  emptyBtn: {
    backgroundColor: C.primaryMid, borderRadius: 24,
    paddingHorizontal: 28, paddingVertical: 12,
    elevation: 4,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10,
  },
  emptyBtnTxt: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  // ── Cart card
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 18, padding: 12,
    flexDirection: "row", alignItems: "center",
    elevation: 2,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  cardDisabled: { opacity: 0.45 },

  checkboxWrap: { padding: 4, marginRight: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 1.5, borderColor: C.primaryTint,
    backgroundColor: C.bg,
    justifyContent: "center", alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: C.primaryMid, borderColor: C.primaryMid,
  },

  cover: {
    width: 64, height: 88, borderRadius: 10,
    backgroundColor: C.primarySoft,
  },

  info: { flex: 1, marginLeft: 12 },
  bookTitle: { fontSize: 14, fontWeight: "700", color: C.text1, lineHeight: 20, marginBottom: 4 },
  bookPrice: { fontSize: 15, fontWeight: "800", color: C.primaryMid, marginBottom: 8 },

  outOfStockBadge: {
    backgroundColor: "#FFF0EE", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    alignSelf: "flex-start", marginBottom: 4,
  },
  outOfStockTxt: { color: C.sale, fontSize: 11, fontWeight: "700" },

  qtyRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.bg, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.border,
    alignSelf: "flex-start", overflow: "hidden",
  },
  qtyBtn: {
    width: 32, height: 32,
    justifyContent: "center", alignItems: "center",
    backgroundColor: C.primarySoft,
  },
  qtyBtnDisabled: { backgroundColor: "#F5F5F5" },
  qtyBtnTxt: { fontSize: 18, fontWeight: "700", color: C.primaryMid, lineHeight: 22 },
  qtyVal: {
    width: 36, textAlign: "center",
    fontSize: 14, fontWeight: "800", color: C.text1,
  },

  subtotal: { marginLeft: 8, alignItems: "flex-end" },
  subtotalTxt: { fontSize: 13, fontWeight: "700", color: C.text2 },

  // ── Swipe delete
  deleteAction: {
    backgroundColor: "#FF5252",
    justifyContent: "center", alignItems: "center",
    width: 76,
    marginBottom: 10,
    borderTopRightRadius: 18, borderBottomRightRadius: 18,
    marginRight: 16,
  },
  deleteActionTxt: { color: "#FFF", fontSize: 11, fontWeight: "700", marginTop: 4 },

  // ── Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 30 : 18,
    borderTopWidth: 1, borderColor: C.border,
    elevation: 20,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10, shadowRadius: 12,
    gap: 12,
  },
  footerSummary: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerLabel: { fontSize: 13, color: C.text3, fontWeight: "500" },
  footerPriceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerPriceLabel: { fontSize: 14, color: C.text2 },
  footerPrice: { fontSize: 22, fontWeight: "900", color: C.sale },

  checkoutBtn: {
    backgroundColor: C.primaryMid,
    borderRadius: 16, paddingVertical: 15,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    elevation: 4,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10,
  },
  checkoutBtnDisabled: { backgroundColor: "#C5D4EA", elevation: 0, shadowOpacity: 0 },
  checkoutTxt: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});