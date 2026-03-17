import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, Modal, SafeAreaView, ActivityIndicator,
  StatusBar, Platform, TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useAuth } from "../../hooks/useAuth";

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
};

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon as any} size={15} color={C.primaryMid} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function CheckoutScreen() {
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user }   = useAuth();

  const { selectedItems = [], totalPrice = 0 } = route.params || {};

  const [currentAddress, setCurrentAddress]   = useState<any>(null);
  const [allAddresses, setAllAddresses]         = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [paymentMethod, setPaymentMethod]       = useState('COD');

  // ── Coupon state
  const [coupon, setCoupon]           = useState("");
  const [couponData, setCouponData]   = useState<any>(null);  // data từ API khi chọn coupon
  const [couponModal, setCouponModal] = useState(false);
  const [couponList, setCouponList]   = useState<any[]>([]);

  // ── Points state
  const [userPoints, setUserPoints]   = useState(0);
  const [usedPoints, setUsedPoints]   = useState(0);
  const [pointsInput, setPointsInput] = useState("");

  useEffect(() => { fetchInitialAddress(); fetchUserPoints(); }, [user?.id]);

  // ==========================
  // API LOGIC (unchanged)
  // ==========================
  const fetchInitialAddress = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/api/addresses/default/${user.id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data) setCurrentAddress(data);
    } catch (err) { console.error("Lỗi fetch địa chỉ:", err); }
  };

  // Load điểm hiện có của user
  const fetchUserPoints = async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.reward_points != null) {
        setUserPoints(data.reward_points);
      }
    } catch (err) { console.log("Lỗi fetch điểm:", err); }
  };

  const openAddressSelector = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/api/addresses/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setAllAddresses(Array.isArray(data) ? data : []);
      setShowAddressModal(true);
    } catch { Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ"); }
    finally { setLoading(false); }
  };

  const selectAddress = (addr: any) => { setCurrentAddress(addr); setShowAddressModal(false); };

  const openCouponSelector = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res   = await fetch(`${BASE_URL}/api/coupons/available/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCouponList(Array.isArray(data) ? data : []);
      setCouponModal(true);
    } catch { Alert.alert("Lỗi", "Không tải được danh sách coupon"); }
  };

  // Chọn coupon — lưu toàn bộ data của coupon để tính locally
  const handleSelectCoupon = (c: any) => {
    setCoupon(c.code);
    setCouponData(c);
    setCouponModal(false);
  };

  const handleRemoveCoupon = () => { setCoupon(""); setCouponData(null); };

  // Thay đổi số điểm muốn dùng
  const handlePointsChange = (val: string) => {
    const raw = Number(val.replace(/[^0-9]/g, "")) || 0;
    const capped = Math.min(raw, userPoints);       // không dùng quá số điểm có
    setPointsInput(capped > 0 ? capped.toString() : "");
    setUsedPoints(capped);
  };

  // ─── Tính giảm giá LOCALLY — không cần gọi API ────────────────────────────
  //  1 điểm = 100đ (điều chỉnh theo backend nếu khác)
  const POINT_RATE = 100;

  const discountFromCoupon = (() => {
    if (!couponData) return 0;
    if (couponData.discount_percent) {
      return Math.round(totalPrice * couponData.discount_percent / 100);
    }
    if (couponData.discount_amount) {
      return Math.min(Number(couponData.discount_amount), totalPrice);
    }
    return 0;
  })();

  const discountFromPoints  = usedPoints * POINT_RATE;
  const totalDiscount       = discountFromCoupon + discountFromPoints;
  const displayedTotal      = Math.max(0, totalPrice - totalDiscount);

  // ==========================
  // ĐẶT HÀNG — gửi thông tin coupon + điểm lên server
  // ==========================
  const handleOrder = async () => {
    if (!currentAddress) { Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng"); return; }
    setLoading(true);
    try {
      const token   = await AsyncStorage.getItem('token');
      const payload = {
        user_id:             user?.id,
        shipping_address_id: currentAddress.id,
        items:               selectedItems,
        total_price:         totalPrice,
        discount_points:     usedPoints,
        discount_coupon:     coupon,
        final_total:         displayedTotal,    // gửi luôn total đã tính
        payment_method:      paymentMethod,
      };
      const res = await fetch(`${BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // ── Đọc field backend trả về ─────────────────────────────
        // { success, orderId, earned_points, bonus_points?, reward_coupon?, reward_coupon_percent? }
        const lines: string[] = ["Đơn hàng của bạn đã được đặt thành công! 🎉"];

        // Điểm tích lũy từ đơn hàng (luôn có)
        if (data.earned_points && data.earned_points > 0) {
          lines.push(`⭐ Tích lũy +${data.earned_points} điểm`);
        }

        // Thưởng thêm điểm bonus (random 50%)
        if (data.bonus_points && data.bonus_points > 0) {
          lines.push(`🎁 May mắn! Thưởng thêm +${data.bonus_points} điểm!`);
        }

        // Thưởng coupon (random 50%)
        if (data.reward_coupon) {
          const pctTxt = data.reward_coupon_percent ? ` giảm ${data.reward_coupon_percent}%` : "";
          lines.push(`🎫 Tặng mã${pctTxt}: ${data.reward_coupon} (30 ngày)`);
        }

        Alert.alert("✅ Đặt hàng thành công", lines.join("\n\n"), [
          { text: "Về trang chủ", onPress: () => navigation.navigate("MainTabs") },
        ]);
      } else {
        Alert.alert("Thất bại", data.error || "Có lỗi xảy ra khi xử lý đơn hàng");
      }
    } catch { Alert.alert("Lỗi", "Kết nối server thất bại"); }
    finally { setLoading(false); }
  };

  const coverUri = (img: string) => img?.startsWith('http') ? img : `${BASE_URL}/uploads/${img}`;

  const PAYMENT_OPTIONS = [
    { key: 'COD',   label: 'Thanh toán khi nhận hàng', sub: 'Trả tiền mặt khi giao hàng', icon: 'cash-outline' },
    { key: 'VNPAY', label: 'Thanh toán qua VNPAY',     sub: 'Thẻ ATM, Internet Banking',   icon: 'card-outline' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── TOP BAR ────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <View style={s.topBarBlob} />
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── 1. ADDRESS ───────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="location-outline" title="Địa chỉ nhận hàng" />
          <TouchableOpacity style={[s.addressBox, !currentAddress && s.addressBoxEmpty]} onPress={openAddressSelector} activeOpacity={0.85}>
            {currentAddress ? (
              <View style={s.addressContent}>
                <View style={s.addressIconWrap}><Ionicons name="location" size={18} color={C.primaryMid} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.addressName}>{currentAddress.recipient_name}<Text style={{ color: C.text3 }}>  |  </Text>{currentAddress.phone_number}</Text>
                  <Text style={s.addressDetail} numberOfLines={2}>
                    {[currentAddress.specific_address, currentAddress.ward, currentAddress.district, currentAddress.province].filter(Boolean).join(", ")}
                  </Text>
                </View>
                <View style={s.changeBtn}><Text style={s.changeBtnTxt}>Đổi</Text></View>
              </View>
            ) : (
              <View style={s.addressEmpty}>
                <Ionicons name="location-outline" size={22} color={C.primaryMid} />
                <Text style={s.addressEmptyTxt}>Chọn địa chỉ giao hàng</Text>
                <Ionicons name="chevron-forward" size={16} color={C.text3} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── 2. PRODUCTS ──────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="bag-outline" title={`Sản phẩm (${selectedItems.length})`} />
          {selectedItems.map((item: any, idx: number) => (
            <View key={item.cart_item_id || item.id} style={[s.itemRow, idx === selectedItems.length - 1 && { borderBottomWidth: 0 }]}>
              <Image source={{ uri: coverUri(item.cover_image) }} style={s.itemImg} resizeMode="cover" />
              <View style={s.itemInfo}>
                <Text style={s.itemTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.itemQtyRow}>
                  <Text style={s.itemQty}>x{item.quantity}</Text>
                  <Text style={s.itemUnitPrice}>{Number(item.price).toLocaleString("vi-VN")}đ/cuốn</Text>
                </View>
              </View>
              <Text style={s.itemTotal}>{(item.price * item.quantity).toLocaleString("vi-VN")}đ</Text>
            </View>
          ))}
        </View>

        {/* ── 3. PAYMENT ───────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="wallet-outline" title="Phương thức thanh toán" />
          <View style={{ gap: 10 }}>
            {PAYMENT_OPTIONS.map(opt => {
              const active = paymentMethod === opt.key;
              return (
                <TouchableOpacity key={opt.key} style={[s.payOption, active && s.payOptionActive]} onPress={() => setPaymentMethod(opt.key)} activeOpacity={0.85}>
                  <View style={[s.payIconWrap, active && s.payIconWrapActive]}>
                    <Ionicons name={opt.icon as any} size={18} color={active ? "#FFF" : C.primaryMid} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.payLabel, active && s.payLabelActive]}>{opt.label}</Text>
                    <Text style={s.paySub}>{opt.sub}</Text>
                  </View>
                  <Ionicons name={active ? "radio-button-on" : "radio-button-off"} size={20} color={active ? C.primaryMid : C.text3} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 4. COUPON ────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="pricetag-outline" title="Mã giảm giá" />
          {coupon ? (
            <View style={s.couponSelectedRow}>
              <View style={s.couponSelectedPill}>
                <Ionicons name="pricetag" size={14} color={C.primaryMid} />
                <Text style={s.couponSelectedCode}>{coupon}</Text>
              </View>
              {discountFromCoupon > 0 && (
                <Text style={s.couponSaveTxt}>-{discountFromCoupon.toLocaleString("vi-VN")}đ</Text>
              )}
              <TouchableOpacity onPress={handleRemoveCoupon} style={{ padding: 2 }}>
                <Ionicons name="close-circle" size={20} color={C.text3} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.selectCouponBtn} onPress={openCouponSelector} activeOpacity={0.85}>
              <Ionicons name="pricetag-outline" size={16} color={C.primaryMid} />
              <Text style={s.selectCouponTxt}>Chọn mã giảm giá</Text>
              <Ionicons name="chevron-forward" size={16} color={C.text3} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── 5. POINTS ────────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="star-outline" title="Điểm thưởng" />

          {/* Points balance */}
          <View style={s.pointsInfoRow}>
            <Ionicons name="star" size={15} color={C.orange} />
            <Text style={s.pointsInfoTxt}>
              Số điểm có:{" "}
              <Text style={{ color: C.orange, fontWeight: "800" }}>{userPoints.toLocaleString("vi-VN")} điểm</Text>
              <Text style={{ color: C.text3 }}>  ≈ {(userPoints * POINT_RATE).toLocaleString("vi-VN")}đ</Text>
            </Text>
          </View>

          {/* Input */}
          <View style={s.pointsInputRow}>
            <TextInput
              placeholder={`Tối đa ${userPoints} điểm`}
              placeholderTextColor={C.text3}
              keyboardType="numeric"
              style={s.inputField}
              value={pointsInput}
              onChangeText={handlePointsChange}
            />
            {usedPoints > 0 && (
              <TouchableOpacity onPress={() => { setUsedPoints(0); setPointsInput(""); }} style={s.clearPointsBtn}>
                <Ionicons name="close-circle" size={18} color={C.text3} />
              </TouchableOpacity>
            )}
          </View>

          {/* Live discount preview */}
          {usedPoints > 0 && (
            <View style={s.discountBadge}>
              <Ionicons name="checkmark-circle-outline" size={15} color={C.green} />
              <Text style={s.discountBadgeTxt}>
                Dùng {usedPoints} điểm → giảm {discountFromPoints.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          )}
        </View>

        {/* ── 6. SUMMARY ───────────────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="receipt-outline" title="Tóm tắt thanh toán" />
          <View style={s.summaryBody}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Tạm tính ({selectedItems.length} sản phẩm)</Text>
              <Text style={s.summaryVal}>{totalPrice.toLocaleString("vi-VN")}đ</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Phí vận chuyển</Text>
              <Text style={[s.summaryVal, { color: C.green }]}>Miễn phí</Text>
            </View>
            {discountFromCoupon > 0 && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Mã giảm ({coupon})</Text>
                <Text style={[s.summaryVal, { color: C.green }]}>-{discountFromCoupon.toLocaleString("vi-VN")}đ</Text>
              </View>
            )}
            {discountFromPoints > 0 && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Điểm thưởng ({usedPoints} điểm)</Text>
                <Text style={[s.summaryVal, { color: C.green }]}>-{discountFromPoints.toLocaleString("vi-VN")}đ</Text>
              </View>
            )}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Phương thức</Text>
              <Text style={[s.summaryVal, { color: C.primaryMid }]}>{paymentMethod}</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryTotalLabel}>Tổng thanh toán</Text>
              <View style={{ alignItems: "flex-end" }}>
                {totalDiscount > 0 && (
                  <Text style={s.summaryOriginal}>{totalPrice.toLocaleString("vi-VN")}đ</Text>
                )}
                <Text style={s.summaryTotalVal}>{displayedTotal.toLocaleString("vi-VN")}đ</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── FOOTER — real-time ───────────────────────────────────── */}
      <View style={s.footer}>
        <View>
          <Text style={s.footerLabel}>Tổng thanh toán</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {totalDiscount > 0 && <Text style={s.footerOriginal}>{totalPrice.toLocaleString("vi-VN")}đ</Text>}
            <Text style={s.footerTotal}>{displayedTotal.toLocaleString("vi-VN")}đ</Text>
          </View>
          {totalDiscount > 0 && <Text style={s.footerSaved}>Tiết kiệm {totalDiscount.toLocaleString("vi-VN")}đ 🎉</Text>}
        </View>
        <TouchableOpacity style={[s.orderBtn, loading && s.orderBtnDisabled]} onPress={handleOrder} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#FFF" /> : (
            <><Ionicons name="checkmark-circle-outline" size={18} color="#FFF" /><Text style={s.orderBtnTxt}>Đặt hàng</Text></>
          )}
        </TouchableOpacity>
      </View>

      {/* ── ADDRESS MODAL ────────────────────────────────────────── */}
      <Modal visible={showAddressModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Chọn địa chỉ giao hàng</Text>
              <TouchableOpacity style={s.sheetCloseBtn} onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={20} color={C.text2} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {allAddresses.map((addr, idx) => {
                const sel = currentAddress?.id === addr.id;
                return (
                  <TouchableOpacity key={addr.id}
                    style={[s.addrItem, sel && s.addrItemActive, idx === allAddresses.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => selectAddress(addr)} activeOpacity={0.85}>
                    <View style={[s.addrAccent, sel && { backgroundColor: C.primaryMid }]} />
                    <View style={s.addrBody}>
                      <View style={s.addrNameRow}>
                        <Text style={s.addrName}>{addr.recipient_name}</Text>
                        {addr.is_default === 1 && <View style={s.defaultBadge}><Text style={s.defaultBadgeTxt}>Mặc định</Text></View>}
                      </View>
                      <Text style={s.addrPhone}>{addr.phone_number}</Text>
                      <Text style={s.addrDetail} numberOfLines={2}>
                        {[addr.specific_address, addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                    <Ionicons name={sel ? "radio-button-on" : "radio-button-off"} size={22} color={sel ? C.primaryMid : C.text3} />
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── COUPON MODAL ─────────────────────────────────────────── */}
      <Modal visible={couponModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Chọn mã giảm giá</Text>
              <TouchableOpacity style={s.sheetCloseBtn} onPress={() => setCouponModal(false)}>
                <Ionicons name="close" size={20} color={C.text2} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {couponList.length === 0 && (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Ionicons name="pricetag-outline" size={44} color={C.primaryTint} />
                  <Text style={{ color: C.text3, marginTop: 10, fontSize: 14 }}>Không có mã giảm giá khả dụng</Text>
                </View>
              )}
              {couponList.map((c: any, idx: number) => {
                const sel = coupon === c.code;
                return (
                  <TouchableOpacity key={c.id}
                    style={[s.couponItem, sel && s.couponItemActive, idx === couponList.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => handleSelectCoupon(c)} activeOpacity={0.85}>
                    <View style={[s.couponIconWrap, sel && s.couponIconWrapActive]}>
                      <Ionicons name="pricetag-outline" size={18} color={sel ? "#FFF" : C.primaryMid} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.couponCode, sel && { color: C.primaryMid }]}>{c.code}</Text>
                      <Text style={s.couponDesc}>
                        {c.discount_percent ? `Giảm ${c.discount_percent}%` : `Giảm ${Number(c.discount_amount).toLocaleString("vi-VN")}đ`}
                      </Text>
                      <Text style={s.couponExpire}>Hạn: {new Date(c.expiry_date).toLocaleDateString("vi-VN")}</Text>
                    </View>
                    {/* Live preview discount amount */}
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <Text style={s.couponPreviewAmt}>
                        -{c.discount_percent
                          ? Math.round(totalPrice * c.discount_percent / 100).toLocaleString("vi-VN")
                          : Math.min(Number(c.discount_amount), totalPrice).toLocaleString("vi-VN")}đ
                      </Text>
                      <Ionicons name={sel ? "radio-button-on" : "radio-button-off"} size={22} color={sel ? C.primaryMid : C.text3} />
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { backgroundColor: C.primaryMid, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10, paddingBottom: 16, paddingHorizontal: 14, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" },
  topBarBlob: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.08)", top: -50, right: -30 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" },
  topBarTitle: { fontSize: 17, fontWeight: "800", color: "#FFF" },
  scroll: { padding: 16, gap: 14 },
  card: { backgroundColor: C.surface, borderRadius: 20, padding: 18, elevation: 2, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: C.text1 },
  addressBox: { borderWidth: 1.5, borderColor: C.primaryTint, borderRadius: 16, overflow: "hidden" },
  addressBoxEmpty: { borderStyle: "dashed" },
  addressContent: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  addressEmpty: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, justifyContent: "center" },
  addressEmptyTxt: { flex: 1, fontSize: 14, color: C.primaryMid, fontWeight: "600" },
  addressIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  addressName: { fontSize: 14, fontWeight: "700", color: C.text1, marginBottom: 4 },
  addressDetail: { fontSize: 13, color: C.text3, lineHeight: 18 },
  changeBtn: { backgroundColor: C.primarySoft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.primaryTint },
  changeBtnTxt: { fontSize: 12, color: C.primaryMid, fontWeight: "700" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: C.border },
  itemImg: { width: 58, height: 80, borderRadius: 10, backgroundColor: C.primarySoft },
  itemInfo: { flex: 1, gap: 5 },
  itemTitle: { fontSize: 13, fontWeight: "700", color: C.text1, lineHeight: 18 },
  itemQtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemQty: { backgroundColor: C.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: "700", color: C.primaryMid },
  itemUnitPrice: { fontSize: 12, color: C.text3 },
  itemTotal: { fontSize: 14, fontWeight: "800", color: C.text1 },
  payOption: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: C.border, borderRadius: 16, padding: 14, backgroundColor: C.bg },
  payOptionActive: { borderColor: C.primaryMid, backgroundColor: C.primarySoft },
  payIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center" },
  payIconWrapActive: { backgroundColor: C.primaryMid },
  payLabel: { fontSize: 14, fontWeight: "700", color: C.text1 },
  payLabelActive: { color: C.primaryMid },
  paySub: { fontSize: 12, color: C.text3, marginTop: 2 },
  couponSelectedRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.primarySoft, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.primaryTint },
  couponSelectedPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.primaryTint },
  couponSelectedCode: { fontSize: 14, fontWeight: "800", color: C.primaryMid },
  couponSaveTxt: { flex: 1, fontSize: 14, fontWeight: "700", color: C.green },
  selectCouponBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, backgroundColor: C.bg },
  selectCouponTxt: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text2 },
  pointsInfoRow: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: C.orangeBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  pointsInfoTxt: { fontSize: 13, color: C.orange },
  pointsInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputField: { flex: 1, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.text1 },
  clearPointsBtn: { padding: 4 },
  discountBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.greenBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  discountBadgeTxt: { fontSize: 13, color: C.green, fontWeight: "700" },
  summaryBody: { gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryLabel: { fontSize: 14, color: C.text2 },
  summaryVal: { fontSize: 14, color: C.text1, fontWeight: "600" },
  summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  summaryTotalLabel: { fontSize: 16, fontWeight: "800", color: C.text1 },
  summaryTotalVal: { fontSize: 20, fontWeight: "900", color: C.sale },
  summaryOriginal: { fontSize: 12, color: C.text3, textDecorationLine: "line-through" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.surface, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 14, paddingBottom: Platform.OS === "ios" ? 30 : 16, borderTopWidth: 1, borderColor: C.border, elevation: 20, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.10, shadowRadius: 12 },
  footerLabel: { fontSize: 13, color: C.text3, marginBottom: 2 },
  footerTotal: { fontSize: 22, fontWeight: "900", color: C.sale },
  footerOriginal: { fontSize: 13, color: C.text3, textDecorationLine: "line-through" },
  footerSaved: { fontSize: 12, color: C.green, fontWeight: "600", marginTop: 2 },
  orderBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.primaryMid, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, elevation: 5, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 10 },
  orderBtnDisabled: { backgroundColor: C.text3, elevation: 0, shadowOpacity: 0 },
  orderBtnTxt: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "72%", paddingTop: 12, paddingBottom: 0 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 12 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderColor: C.border },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: C.text1 },
  sheetCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  addrItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: C.border, gap: 12 },
  addrItemActive: { backgroundColor: C.primarySoft },
  addrAccent: { width: 4, position: "absolute", left: 0, top: 14, bottom: 14, backgroundColor: C.border, borderRadius: 4 },
  addrBody: { flex: 1, paddingLeft: 4 },
  addrNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  addrName: { fontSize: 14, fontWeight: "700", color: C.text1 },
  defaultBadge: { backgroundColor: C.primarySoft, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: C.primaryTint },
  defaultBadgeTxt: { fontSize: 10, color: C.primaryMid, fontWeight: "700" },
  addrPhone: { fontSize: 13, color: C.text2, marginBottom: 3 },
  addrDetail: { fontSize: 12, color: C.text3, lineHeight: 17 },
  couponItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: C.border, gap: 12 },
  couponItemActive: { backgroundColor: C.primarySoft },
  couponIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center" },
  couponIconWrapActive: { backgroundColor: C.primaryMid },
  couponCode: { fontSize: 15, fontWeight: "800", color: C.text1, marginBottom: 2 },
  couponDesc: { fontSize: 13, color: C.text2, marginBottom: 2 },
  couponExpire: { fontSize: 11, color: C.text3 },
  couponPreviewAmt: { fontSize: 13, fontWeight: "800", color: C.green },
});