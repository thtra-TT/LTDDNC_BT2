import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  RefreshControl, Alert, SafeAreaView, ActivityIndicator,
  StatusBar, Platform,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../hooks/useAuth";
import Constants from "expo-constants";

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
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const AddressList = () => {
  const { user }     = useAuth();
  const navigation   = useNavigation<any>();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const fetchAddresses = async () => {
    if (!user?.id) return;
    try {
      const token    = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/addresses/${user.id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  useFocusEffect(useCallback(() => { fetchAddresses(); }, [user?.id]));

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
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchAddresses();
        },
      },
    ]);
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />
      <ActivityIndicator size="large" color={C.primaryMid} />
      <Text style={{ color: C.text3, marginTop: 10, fontSize: 14 }}>Đang tải địa chỉ...</Text>
    </View>
  );

  const defaultAddr  = addresses.find(a => a.is_default === 1);
  const otherAddrs   = addresses.filter(a => a.is_default !== 1);
  const sortedList   = defaultAddr ? [defaultAddr, ...otherAddrs] : otherAddrs;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── HEADER ─────────────────────────────────────────────── */}
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
          <Text style={s.headerTitle}>Địa chỉ nhận hàng</Text>
          <TouchableOpacity
            style={s.addIconBtn}
            onPress={() => navigation.navigate('AddressForm', { id: null })}
          >
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* count strip */}
        <View style={s.countStrip}>
          <Ionicons name="location-outline" size={15} color="rgba(255,255,255,0.80)" />
          <Text style={s.countTxt}>
            {addresses.length === 0
              ? "Chưa có địa chỉ nào"
              : `${addresses.length} địa chỉ đã lưu`}
          </Text>
        </View>
      </View>

      {/* ── LIST ───────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAddresses}
            colors={[C.primaryMid]}
            tintColor={C.primaryMid}
          />
        }
      >
        {sortedList.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────── */
          <View style={s.emptyBox}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="location-outline" size={48} color={C.primaryTint} />
            </View>
            <Text style={s.emptyTitle}>Chưa có địa chỉ nào</Text>
            <Text style={s.emptySub}>Thêm địa chỉ để thanh toán nhanh hơn</Text>
            <TouchableOpacity
              style={s.emptyAddBtn}
              onPress={() => navigation.navigate('AddressForm', { id: null })}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={s.emptyAddBtnTxt}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedList.map((item, index) => {
            const isDefault = item.is_default === 1;
            return (
              <View key={item.id} style={[s.card, isDefault && s.cardDefault]}>
                {/* left accent */}
                <View style={[s.cardAccent, { backgroundColor: isDefault ? C.primaryMid : C.border }]} />

                <View style={s.cardBody}>
                  {/* Name row */}
                  <View style={s.nameRow}>
                    <Text style={s.nameTxt}>{item.recipient_name}</Text>
                    {isDefault && (
                      <View style={s.defaultBadge}>
                        <Ionicons name="star" size={9} color={C.primaryMid} />
                        <Text style={s.defaultBadgeTxt}>Mặc định</Text>
                      </View>
                    )}
                  </View>

                  {/* Phone */}
                  <View style={s.metaRow}>
                    <Ionicons name="call-outline" size={13} color={C.text3} />
                    <Text style={s.phoneTxt}>{item.phone_number}</Text>
                  </View>

                  {/* Address */}
                  <View style={s.metaRow}>
                    <Ionicons name="location-outline" size={13} color={C.text3} />
                    <Text style={s.addressTxt}>
                      {[item.specific_address, item.ward, item.district, item.province]
                        .filter(Boolean).join(", ")}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={s.actions}>
                    <TouchableOpacity
                      style={s.editBtn}
                      onPress={() => navigation.navigate('AddressForm', { id: item.id })}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="pencil-outline" size={14} color={C.primaryMid} />
                      <Text style={s.editBtnTxt}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    {!isDefault && (
                      <TouchableOpacity
                        style={s.deleteBtn}
                        onPress={() => handleDelete(item.id, item.is_default)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={14} color={C.sale} />
                        <Text style={s.deleteBtnTxt}>Xóa</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AddressForm', { id: null })}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={s.addBtnTxt}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Header
  header: {
    backgroundColor: C.primaryMid,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerBlob1: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)", top: -60, right: -40,
  },
  headerBlob2: {
    position: "absolute", width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)", bottom: -20, left: "40%",
  },
  headerTop: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  addIconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  countStrip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "flex-start",
  },
  countTxt: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "500" },

  scroll: { padding: 16, gap: 0 },

  // ── Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 18, marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 2,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  cardDefault: {
    borderWidth: 1.5, borderColor: C.primaryTint,
  },
  cardAccent: {
    width: 4,
    borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
  },
  cardBody: { flex: 1, padding: 14, gap: 6 },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameTxt: { fontSize: 16, fontWeight: "800", color: C.text1 },
  defaultBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.primarySoft,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.primaryTint,
  },
  defaultBadgeTxt: { fontSize: 11, color: C.primaryMid, fontWeight: "700" },

  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  phoneTxt: { fontSize: 13, color: C.text2, fontWeight: "500" },
  addressTxt: { flex: 1, fontSize: 13, color: C.text3, lineHeight: 18 },

  actions: {
    flexDirection: "row", gap: 8, marginTop: 6,
    paddingTop: 10, borderTopWidth: 1, borderColor: C.border,
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.primarySoft, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: C.primaryTint,
  },
  editBtnTxt: { fontSize: 12, color: C.primaryMid, fontWeight: "700" },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FFF1EE", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "#FFCDD2",
  },
  deleteBtnTxt: { fontSize: 12, color: C.sale, fontWeight: "700" },

  // ── Empty
  emptyBox: {
    alignItems: "center", paddingTop: 60, gap: 10,
  },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: C.text1 },
  emptySub:   { fontSize: 14, color: C.text3, textAlign: "center" },
  emptyAddBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.primaryMid, borderRadius: 24,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
    elevation: 4,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10,
  },
  emptyAddBtnTxt: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  // ── Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1, borderColor: C.border,
    elevation: 16,
    shadowColor: C.primaryMid,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, shadowRadius: 10,
  },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMid, borderRadius: 16, paddingVertical: 15,
    elevation: 4,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 10,
  },
  addBtnTxt: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});

export default AddressList;