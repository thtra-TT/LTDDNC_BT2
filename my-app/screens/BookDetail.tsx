import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Dimensions, Alert, StatusBar, Platform, Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../services/api";
// ─── KEY IMPORT: lưu lịch sử xem ────────────────────────────────────────────
import { saveRecentlyViewed } from "../services/recentlyViewed";

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",
  primaryMid:  "#1E88E5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  sale:        "#E53935",
  saleBg:      "#FFF1EE",
  star:        "#FFC107",
  starBg:      "#FFFBF0",
  green:       "#00AB56",
  greenBg:     "#E0F2F1",
  orange:      "#FF8C00",
  orangeBg:    "#FFF8EE",
  blue:        "#1A94FF",
  blueSoft:    "#EBF5FF",
  bg:          "#F0F6FF",
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  text1:       "#0D1B3E",
  text2:       "#4A5980",
  text3:       "#9AA8C8",
};

function Pill({ label, bg = C.bg, color = C.text2, icon }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", gap: 4 }}>
      {icon ? <Text style={{ fontSize: 12 }}>{icon}</Text> : null}
      <Text style={{ fontSize: 12, color, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

function StarRow({ rating, count, size = 13 }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= rating ? C.star : "#D8E4F0" }}>★</Text>
      ))}
      {count != null && <Text style={{ fontSize: 12, color: C.text3, marginLeft: 2 }}>({count})</Text>}
    </View>
  );
}

function SectionHeader({ title, right }: any) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 3, height: 18, backgroundColor: C.primaryMid, borderRadius: 4 }} />
        <Text style={{ fontSize: 16, fontWeight: "800", color: C.text1 }}>{title}</Text>
      </View>
      {right || null}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 8, backgroundColor: C.bg, marginHorizontal: -20, marginVertical: 4 }} />;
}

function RatingBar({ star, count, total }: any) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
      <Text style={{ width: 10, fontSize: 12, color: C.text2 }}>{star}</Text>
      <Text style={{ fontSize: 11, color: C.star }}>★</Text>
      <View style={{ flex: 1, height: 6, backgroundColor: C.primaryTint, borderRadius: 3, overflow: "hidden" }}>
        <View style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: C.star, borderRadius: 3 }} />
      </View>
      <Text style={{ width: 20, fontSize: 11, color: C.text3, textAlign: "right" }}>{count}</Text>
    </View>
  );
}

function BottomBar({ quantity, onDecrease, onIncrease, onAddCart, isOutOfStock }: any) {
  return (
    <View style={s.bottomBar}>
      {!isOutOfStock && (
        <View style={s.qtyWrap}>
          <TouchableOpacity onPress={onDecrease} style={s.qtyBtn}><Text style={s.qtyBtnTxt}>−</Text></TouchableOpacity>
          <Text style={s.qtyVal}>{quantity}</Text>
          <TouchableOpacity onPress={onIncrease} style={s.qtyBtn}><Text style={s.qtyBtnTxt}>+</Text></TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={[s.cartBtn, isOutOfStock && { backgroundColor: "#C5D4EA", flex: 1 }]}
        onPress={onAddCart} disabled={isOutOfStock} activeOpacity={0.85}
      >
        <Text style={{ fontSize: 20 }}>🛒</Text>
        <Text style={s.cartBtnTxt}>{isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const AV_COLORS = ["#1565C0","#1976D2","#0277BD","#006064","#00838F","#283593","#4527A0","#1B5E20"];
function avatarColor(name = "") { return AV_COLORS[(name.charCodeAt(0) || 0) % AV_COLORS.length]; }

export default function BookDetail() {
  const { user }     = useAuth();
  const route        = useRoute<any>();
  const navigation   = useNavigation<any>();
  const { id }       = route.params;

  const [quantity, setQuantity]           = useState(1);
  const [book, setBook]                   = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [reviews, setReviews]             = useState<any[]>([]);
  const [isFavorite, setIsFavorite]       = useState(false);
  const [showFullDesc, setShowFullDesc]   = useState(false);

  const scrollY       = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({ inputRange: [180, 260], outputRange: [0, 1], extrapolate: "clamp" });

  // ==========================
  // API LOGIC (all unchanged)
  // ==========================
  const loadReviews = async () => {
    try { const res = await api.get(`/reviews/book/${id}`); setReviews(res.data); }
    catch (e) { console.log("Lỗi tải review:", e); }
  };

  const loadBook = async () => {
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data);

      // ── LƯU VÀO LỊCH SỬ XEM NGAY SAU KHI LOAD THÀNH CÔNG ────
      // Đây là chỗ duy nhất cần gọi saveRecentlyViewed
      saveRecentlyViewed({
        id:             res.data.id,
        title:         res.data.title,
        author_name:   res.data.author_name,
        cover_image:   res.data.cover_image,
        price:         res.data.price,
        original_price: res.data.original_price,
      });

    } catch (error) { console.log("❌ Lỗi tải sách:", error); }
    finally { setLoading(false); }
  };

  const loadFavoriteState = async () => {
    try {
      const res = await api.get("/wishlist");
      setIsFavorite(res.data.some((item: any) => item.book_id == id));
    } catch (err) { console.log("❌ Lỗi load wishlist:", err); }
  };

  useEffect(() => { loadReviews(); },       [id]);
  useEffect(() => { loadBook(); },          [id]);
  useEffect(() => { loadFavoriteState(); }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) { await api.delete(`/wishlist/${id}`); setIsFavorite(false); }
      else { await api.post("/wishlist", { book_id: id }); setIsFavorite(true); }
    } catch (error) { console.log("Lỗi toggle:", error); }
  };

  const handleAddToCart = async () => {
    if (!book || book.stock <= 0) { Alert.alert("Thông báo", "Sản phẩm hiện đã hết hàng."); return; }
    try {
      await api.post("/cart/add", { userId: user.id, bookId: book.id, quantity });
      Alert.alert("✓ Thành công", "Đã thêm vào giỏ hàng!");
    } catch (error: any) { Alert.alert("Lỗi", error.response?.data?.message || "Có lỗi xảy ra"); }
  };

  if (loading) return (
    <View style={s.loadingScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ActivityIndicator size="large" color={C.primaryMid} />
      <Text style={{ color: C.text3, marginTop: 10, fontSize: 14 }}>Đang tải sách...</Text>
    </View>
  );

  if (!book) return (
    <View style={s.loadingScreen}>
      <Text style={{ fontSize: 44 }}>📚</Text>
      <Text style={{ color: C.text2, marginTop: 10, fontSize: 15 }}>Không tìm thấy sách</Text>
    </View>
  );

  const isOutOfStock = book.stock <= 0;
  const avgRating    = reviews.length > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0;
  const roundedAvg   = Math.round(avgRating);
  const ratingDist   = [5,4,3,2,1].map(star => ({ star, count: reviews.filter((r: any) => r.rating === star).length }));
  const stockColor   = isOutOfStock ? C.sale : book.stock < 10 ? C.orange : C.green;
  const stockBg      = isOutOfStock ? C.saleBg : book.stock < 10 ? C.orangeBg : C.greenBg;
  const stockLabel   = isOutOfStock ? "Hết hàng" : book.stock < 10 ? `Sắp hết — còn ${book.stock}` : `Còn hàng (${book.stock})`;
  const stockIcon    = isOutOfStock ? "✕" : book.stock < 10 ? "⚡" : "✓";
  const descText     = book.description || "";
  const longDesc     = descText.length > 220;
  const shownDesc    = showFullDesc || !longDesc ? descText : descText.slice(0, 220) + "...";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View style={[s.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={s.stickyTitle} numberOfLines={1}>{book.title}</Text>
      </Animated.View>

      <View style={s.navOverlay}>
        <TouchableOpacity style={s.navBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Text style={{ fontSize: 24, color: C.text1, lineHeight: 30 }}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={toggleFavorite}>
          <Text style={{ fontSize: 19 }}>{isFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={s.heroBlock}>
          <View style={s.heroBgTop} /><View style={s.heroBgBottom} />
          <View style={s.heroCircle1} /><View style={s.heroCircle2} />
          <Image source={{ uri: book.cover_image }} style={s.coverImg} resizeMode="cover" />
          <View style={s.soldRibbon}>
            <Text style={s.soldRibbonTxt}>🔥 {book.buyersCount || 0} đã mua</Text>
          </View>
        </View>

        {/* Main card */}
        <View style={s.mainCard}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Pill label={book.category_name} bg={C.primarySoft} color={C.primaryMid} icon="📂" />
            <Pill label={stockLabel} bg={stockBg} color={stockColor} icon={stockIcon} />
          </View>
          <Text style={s.title}>{book.title}</Text>
          <Text style={s.authorLine}>✍️  {book.author_name}</Text>
          {reviews.length > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <StarRow rating={roundedAvg} count={reviews.length} size={15} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.star }}>{avgRating.toFixed(1)}</Text>
              <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.text3 }} />
              <Text style={{ fontSize: 13, color: C.text2 }}>💬 {book.reviewsCount || reviews.length} đánh giá</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
            <Text style={s.priceMain}>{book.price?.toLocaleString("vi-VN")} ₫</Text>
            <View style={s.saleBadge}><Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>Giá tốt</Text></View>
          </View>
          <View style={s.publisherRow}>
            <Text style={{ fontSize: 13, color: C.text3 }}>Nhà xuất bản</Text>
            <Text style={{ fontSize: 13, color: C.text1, fontWeight: "600" }}>{book.publisher_name}</Text>
          </View>
        </View>

        {/* Promo strip */}
        <View style={s.promoStrip}>
          {[{ icon: "🚚", txt: "Miễn phí vận chuyển" }, { icon: "↩️", txt: "Đổi trả 7 ngày" }, { icon: "✅", txt: "Hàng chính hãng" }]
            .map((p, i) => (
              <View key={i} style={s.promoItem}>
                <View style={s.promoIconCircle}><Text style={{ fontSize: 18 }}>{p.icon}</Text></View>
                <Text style={s.promoTxt}>{p.txt}</Text>
              </View>
            ))}
        </View>

        {/* Description */}
        <View style={s.section}>
          <SectionHeader title="Mô tả sách" />
          <Text style={{ fontSize: 14.5, lineHeight: 24, color: C.text2 }}>{shownDesc}</Text>
          {longDesc && (
            <TouchableOpacity onPress={() => setShowFullDesc(v => !v)} style={{ marginTop: 10, alignSelf: "flex-start" }}>
              <Text style={{ color: C.primaryMid, fontWeight: "700", fontSize: 14 }}>{showFullDesc ? "Thu gọn ▲" : "Xem thêm ▼"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Divider />

        {/* Reviews */}
        <View style={s.section}>
          <SectionHeader title="Đánh giá sản phẩm"
            right={reviews.length > 0 ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Text style={{ fontSize: 22, fontWeight: "800", color: C.star }}>{avgRating.toFixed(1)}</Text>
                <Text style={{ fontSize: 14, color: C.star }}>★</Text>
              </View>
            ) : null}
          />
          {reviews.length > 0 && (
            <View style={s.ratingDistBlock}>
              <View style={{ alignItems: "center", justifyContent: "center", width: 84 }}>
                <Text style={{ fontSize: 44, fontWeight: "800", color: C.text1, lineHeight: 52 }}>{avgRating.toFixed(1)}</Text>
                <StarRow rating={roundedAvg} size={15} />
                <Text style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{reviews.length} đánh giá</Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                {ratingDist.map(d => <RatingBar key={d.star} star={d.star} count={d.count} total={reviews.length} />)}
              </View>
            </View>
          )}
          {reviews.length === 0 ? (
            <View style={s.emptyState}><Text style={{ fontSize: 36 }}>💬</Text><Text style={{ color: C.text3, marginTop: 8, fontSize: 14 }}>Chưa có đánh giá nào</Text></View>
          ) : (
            reviews.map((rv: any, i: number) => (
              <View key={i} style={s.reviewCard}>
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <View style={[s.avatar, { backgroundColor: avatarColor(rv.full_name) }]}>
                    <Text style={s.avatarTxt}>{rv.full_name?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: C.text1, marginBottom: 3 }}>{rv.full_name}</Text>
                    <StarRow rating={rv.rating} size={12} />
                  </View>
                </View>
                <Text style={{ fontSize: 14, color: C.text2, lineHeight: 21 }}>{rv.comment}</Text>
              </View>
            ))
          )}
        </View>
      </Animated.ScrollView>

      <BottomBar
        quantity={quantity}
        onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
        onIncrease={() => setQuantity(q => Math.min(book.stock, q + 1))}
        onAddCart={handleAddToCart}
        isOutOfStock={isOutOfStock}
      />
    </View>
  );
}

const s = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  stickyHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 99, backgroundColor: "#FFF", paddingTop: (StatusBar.currentHeight || 44), paddingBottom: 12, paddingHorizontal: 60, borderBottomWidth: 1, borderColor: C.border, alignItems: "center", elevation: 8, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8 },
  stickyTitle: { fontSize: 15, fontWeight: "700", color: C.text1 },
  navOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: (StatusBar.currentHeight || 44) + 8, paddingHorizontal: 14, paddingBottom: 8 },
  navBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.93)", justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 5 },
  heroBlock: { width: "100%", height: SH * 0.44, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  heroBgTop: { position: "absolute", top: 0, left: 0, right: 0, height: "65%", backgroundColor: C.primarySoft },
  heroBgBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", backgroundColor: C.bg },
  heroCircle1: { position: "absolute", width: 240, height: 240, borderRadius: 120, backgroundColor: C.primaryTint, opacity: 0.45, top: -60, right: -60 },
  heroCircle2: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: C.primaryTint, opacity: 0.30, bottom: 20, left: -40 },
  coverImg: { width: SW * 0.50, height: SH * 0.35, borderRadius: 18, elevation: 20, shadowColor: C.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.25, shadowRadius: 28 },
  soldRibbon: { position: "absolute", bottom: 16, left: 20, backgroundColor: "rgba(21,101,192,0.80)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  soldRibbonTxt: { fontSize: 12, color: "#FFF", fontWeight: "600" },
  mainCard: { backgroundColor: C.surface, padding: 20, marginBottom: 2, gap: 10 },
  title: { fontSize: 22, fontWeight: "800", color: C.text1, lineHeight: 30 },
  authorLine: { fontSize: 14, color: C.primaryMid, fontWeight: "600" },
  priceMain: { fontSize: 30, fontWeight: "800", color: C.sale },
  saleBadge: { backgroundColor: C.sale, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  publisherRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderColor: C.border },
  promoStrip: { backgroundColor: C.surface, flexDirection: "row", paddingVertical: 16, paddingHorizontal: 12, borderTopWidth: 1, borderColor: C.border, marginBottom: 2 },
  promoItem: { flex: 1, alignItems: "center", gap: 6 },
  promoIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center" },
  promoTxt: { fontSize: 11, color: C.text2, textAlign: "center", fontWeight: "600" },
  section: { backgroundColor: C.surface, padding: 20, marginBottom: 2 },
  ratingDistBlock: { flexDirection: "row", gap: 16, backgroundColor: C.starBg, borderRadius: 16, padding: 16, marginBottom: 18 },
  reviewCard: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  avatarTxt: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  emptyState: { alignItems: "center", paddingVertical: 30, borderWidth: 1, borderStyle: "dashed", borderColor: C.border, borderRadius: 16 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 10, backgroundColor: C.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 28 : 14, borderTopWidth: 1, borderColor: C.border, elevation: 20, shadowColor: C.primary, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.10, shadowRadius: 12 },
  qtyWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: C.primaryMid, borderRadius: 12, overflow: "hidden" },
  qtyBtn: { width: 42, height: 50, justifyContent: "center", alignItems: "center", backgroundColor: C.primarySoft },
  qtyBtnTxt: { fontSize: 22, fontWeight: "700", color: C.primaryMid, lineHeight: 26 },
  qtyVal: { width: 46, textAlign: "center", fontSize: 17, fontWeight: "800", color: C.text1 },
  cartBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: C.primaryMid, borderRadius: 14, height: 50, elevation: 5, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
  cartBtnTxt: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});