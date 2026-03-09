

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, Modal, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useAuth } from "../../hooks/useAuth";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export default function CheckoutScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Nhận dữ liệu từ VNScreen. Đảm bảo item có cart_item_id và book_id
  const { selectedItems = [], totalPrice = 0 } = route.params || {};

  const [currentAddress, setCurrentAddress] = useState<any>(null);
  const [allAddresses, setAllAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định là COD

  useEffect(() => {
    fetchInitialAddress();
  }, [user?.id]);

  // 1. Lấy địa chỉ mặc định khi vào màn hình
  const fetchInitialAddress = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/addresses/default/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok && data) {
        setCurrentAddress(data);
      }
    } catch (err) {
      console.error("Lỗi fetch địa chỉ:", err);
    }
  };

  // 2. Load danh sách địa chỉ để thay đổi
  const openAddressSelector = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/addresses/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAllAddresses(Array.isArray(data) ? data : []);
      setShowAddressModal(true);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = (addr: any) => {
    setCurrentAddress(addr);
    setShowAddressModal(false);
  };

  // 3. Xử lý đặt hàng (Trừ kho + Xóa giỏ hàng thông qua Controller)
  const handleOrder = async () => {
    if (!currentAddress) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        user_id: user?.id,
        shipping_address_id: currentAddress.id,
        items: selectedItems, // Mỗi item cần: book_id, cart_item_id, quantity, price
        total_price: totalPrice,
        payment_method: paymentMethod
      };

      const response = await fetch(`${BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
//         if (paymentMethod === 'VNPAY') {
//           Alert.alert("Thông báo", "Hệ thống sẽ chuyển hướng đến cổng VNPAY (Tính năng đang phát triển)");
//           // Ở đây bạn có thể gọi API lấy link VNPAY và mở WebView
//         } else {
          Alert.alert("Thành công", "Đơn hàng của bạn đã được đặt thành công!", [
            { text: "Về trang chủ", onPress: () => navigation.navigate("MainTabs") }
          ]);
//         }
      } else {
        Alert.alert("Thất bại", resData.error || "Có lỗi xảy ra khi xử lý đơn hàng");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Kết nối server thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 15 }}>

        {/* Địa chỉ */}
        <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
        <TouchableOpacity style={styles.addressCard} onPress={openAddressSelector}>
          <Ionicons name="location" size={24} color="#6C63FF" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            {currentAddress ? (
              <View>
                <Text style={styles.boldText}>{currentAddress.recipient_name} | {currentAddress.phone_number}</Text>
                <Text style={styles.grayText}>
                  {`${currentAddress.specific_address}, ${currentAddress.ward}, ${currentAddress.district}, ${currentAddress.province}`}
                </Text>
              </View>
            ) : (
              <Text style={{ color: 'red' }}>Chưa chọn địa chỉ giao hàng</Text>
            )}
          </View>
          <Text style={styles.changeBtn}>Thay đổi</Text>
        </TouchableOpacity>

        {/* Sản phẩm */}
        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Sản phẩm đã chọn</Text>
        {selectedItems.map((item: any) => (
          <View key={item.cart_item_id || item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.cover_image?.startsWith('http') ? item.cover_image : `${BASE_URL}/uploads/${item.cover_image}` }}
              style={styles.itemImg}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.grayText}>Số lượng: {item.quantity}</Text>
            </View>
            <Text style={styles.priceText}>{(item.price * item.quantity).toLocaleString()}đ</Text>
          </View>
        ))}

        {/* Phương thức thanh toán */}
        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Phương thức thanh toán</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons
              name={paymentMethod === 'COD' ? "radio-button-on" : "radio-button-off"}
              size={22} color="#6C63FF"
            />
            <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, { marginTop: 15 }]}
            onPress={() => setPaymentMethod('VNPAY')}
          >
            <Ionicons
              name={paymentMethod === 'VNPAY' ? "radio-button-on" : "radio-button-off"}
              size={22} color="#6C63FF"
            />
            <Text style={styles.paymentText}>Thanh toán qua VNPAY</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.grayText}>Tổng thanh toán</Text>
          <Text style={styles.totalPriceText}>{totalPrice.toLocaleString()}đ</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, loading && { backgroundColor: '#AAA' }]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>ĐẶT HÀNG</Text>}
        </TouchableOpacity>
      </View>

      {/* MODAL ĐỊA CHỈ */}
      <Modal visible={showAddressModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn địa chỉ</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {allAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addrItem, currentAddress?.id === addr.id && styles.activeAddr]}
                  onPress={() => selectAddress(addr)}
                >
                  <Ionicons
                    name={currentAddress?.id === addr.id ? "radio-button-on" : "radio-button-off"}
                    size={22} color="#6C63FF"
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.boldText}>{addr.recipient_name} ({addr.phone_number})</Text>
                    <Text style={styles.grayText}>{`${addr.specific_address}, ${addr.ward}, ${addr.district}`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  addressCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 15,
    flexDirection: 'row', alignItems: 'center', elevation: 2
  },
  paymentContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 15, elevation: 2 },
  paymentOption: { flexDirection: 'row', alignItems: 'center' },
  paymentText: { marginLeft: 10, fontSize: 14, color: '#333' },
  boldText: { fontWeight: 'bold', fontSize: 15 },
  grayText: { color: '#777', fontSize: 13 },
  changeBtn: { color: '#6C63FF', fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 12, alignItems: 'center' },
  itemImg: { width: 50, height: 70, borderRadius: 6 },
  itemTitle: { fontWeight: '500', flex: 1 },
  priceText: { fontWeight: 'bold', color: '#6C63FF' },
  footer: { padding: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEE' },
  totalPriceText: { fontSize: 22, fontWeight: 'bold', color: '#E53935' },
  orderBtn: { backgroundColor: '#6C63FF', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 15 },
  orderBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  addrItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  activeAddr: { backgroundColor: '#F0EFFF' }
});