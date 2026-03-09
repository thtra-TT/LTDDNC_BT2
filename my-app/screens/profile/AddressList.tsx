import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, Alert, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../hooks/useAuth";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const AddressList = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/addresses/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi lấy địa chỉ:", err);
      setAddresses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [user?.id])
  );

  const handleDelete = async (id: number, isDefault: number) => {
    if (isDefault === 1) return Alert.alert("Thông báo", "Không thể xóa địa chỉ mặc định");
    Alert.alert("Xác nhận", "Xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa", style: "destructive",
        onPress: async () => {
          const token = await AsyncStorage.getItem('token');
          await fetch(`${BASE_URL}/api/addresses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchAddresses();
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Sửa lỗi truyền id ở đây */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Địa chỉ nhận hàng</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddressForm', { id: null })}>
          <Ionicons name="add-circle" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAddresses} />}
      >
        {addresses.length > 0 ? (
          addresses.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{item.recipient_name}</Text>
                  {item.is_default === 1 && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultLabel}>MẶC ĐỊNH</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.phoneText}>{item.phone_number}</Text>
                <Text style={styles.addressText}>
                  {item.specific_address}, {item.ward}, {item.district}, {item.province}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => navigation.navigate('AddressForm', { id: item.id })}>
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
                {item.is_default !== 1 && (
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.is_default)}>
                    <Text style={styles.deleteText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.center, { marginTop: 50 }]}>
            <Ionicons name="location-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => navigation.navigate('AddressForm', { id: null })}
        >
          <Text style={styles.submitBtnText}>THÊM ĐỊA CHỈ MỚI</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: "#6C63FF", padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  scrollContent: { padding: 15, paddingBottom: 100 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: "row", elevation: 3 },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  nameText: { fontSize: 16, fontWeight: "bold", color: "#333", marginRight: 8 },
  defaultBadge: { backgroundColor: "#FFEBEB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: "#FF4D4D" },
  defaultLabel: { fontSize: 9, color: "#FF4D4D", fontWeight: "bold" },
  phoneText: { fontSize: 14, color: "#666", marginBottom: 4 },
  addressText: { fontSize: 13, color: "#888", lineHeight: 18 },
  cardActions: { justifyContent: "space-around", alignItems: "flex-end", marginLeft: 10 },
  editText: { color: "#4A90E2", fontWeight: "600", marginBottom: 15 },
  deleteText: { color: "#FF4D4D", fontWeight: "600" },
  emptyText: { color: "#AAA", marginTop: 10 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: "#fff" },
  submitBtn: { backgroundColor: "#6C63FF", padding: 15, borderRadius: 10, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default AddressList;