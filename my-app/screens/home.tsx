import {
  View, Text, Image, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, StatusBar, Modal,
  FlatList, Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  type RecentBook,
} from "../services/recentlyViewed";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:     "#1565C0",
  primaryMid:  "#1E88E5",
  primaryLight:"#42A5F5",
  primarySoft: "#E3F2FD",
  primaryTint: "#BBDEFB",
  sale:        "#E53935",
  saleBg:      "#FFF1EF",
  saleBadge:   "#EE4D2D",
  bg:          "#F0F6FF",
  surface:     "#FFFFFF",
  border:      "#DDEEFF",
  text1:       "#0D1B3E",
  text2:       "#4A5980",
  text3:       "#9AA8C8",
  star:        "#FFC107",
};

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionTitle({ title, onMore }: any) {
  return (
    <View style={s.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 3, height: 18, backgroundColor: C.primaryMid, borderRadius: 4 }} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {onMore && (
        <TouchableOpacity onPress={onMore}>
          <Text style={s.sectionMore}>Xem thêm ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Recently Viewed Section ──────────────────────────────────────────────────
function RecentlyViewedSection({ items, onPress, onClear }: {
  items: RecentBook[];
  onPress: (id: number) => void;
  onClear: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <View>
      <View style={s.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 3, height: 18, backgroundColor: "#F57C00", borderRadius: 4 }} />
          <Text style={s.sectionTitle}>🕐 Đã xem gần đây</Text>
        </View>
        <TouchableOpacity onPress={onClear} style={s.clearBtn}>
          <Ionicons name="trash-outline" size={13} color={C.text3} />
          <Text style={s.clearBtnTxt}>Xóa</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        horizontal
        keyExtractor={item => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingBottom: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.recentCard} onPress={() => onPress(item.id)} activeOpacity={0.85}>
            <Image source={{ uri: item.cover_image }} style={s.recentImg} resizeMode="cover" />
            <Text style={s.recentTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={s.recentAuthor} numberOfLines={1}>{item.author_name}</Text>
            <Text style={s.recentPrice}>{Number(item.price).toLocaleString("vi-VN")}đ</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Similar Books Bottom Sheet ───────────────────────────────────────────────
function SimilarBooksSheet({ visible, book, onClose, onNavigate }: {
  visible: boolean; book: any; onClose: () => void; onNavigate: (id: number) => void;
}) {
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (visible && book?.id) { loadSimilar(book.id); }
    else { setSimilarBooks([]); }
  }, [visible, book?.id]);

  const loadSimilar = async (bookId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/books/${bookId}/similar`);
      setSimilarBooks(res.data);
    } catch (err) { console.log("Lỗi load sách tương tự:", err); }
    finally { setLoading(false); }
  };

  if (!book) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.sheetOverlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={e => e.stopPropagation()}>
          <View style={s.sheetHandle} />
          <View style={s.sheetTriggerCard}>
            <Image source={{ uri: book.cover_image }} style={s.sheetTriggerImg} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={s.sheetTriggerTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={s.sheetTriggerAuthor} numberOfLines={1}>{book.author_name}</Text>
              <Text style={s.sheetTriggerPrice}>{Number(book.price).toLocaleString("vi-VN")}đ</Text>
            </View>
            <TouchableOpacity style={s.sheetViewBtn} onPress={() => { onClose(); onNavigate(book.id); }} activeOpacity={0.85}>
              <Text style={s.sheetViewBtnTxt}>Xem</Text>
            </TouchableOpacity>
          </View>
          <View style={s.sheetDivider}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            <Text style={s.sheetDividerTxt}>Sản phẩm tương tự</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          </View>
          {loading ? (
            <View style={{ paddingVertical: 36, alignItems: "center" }}>
              <ActivityIndicator size="large" color={C.primaryMid} />
              <Text style={{ color: C.text3, marginTop: 10, fontSize: 13 }}>Đang tìm sách tương tự...</Text>
            </View>
          ) : similarBooks.length === 0 ? (
            <View style={s.sheetEmpty}>
              <Ionicons name="books-outline" size={40} color={C.primaryTint} />
              <Text style={s.sheetEmptyTxt}>Không có sách tương tự</Text>
            </View>
          ) : (
            <FlatList
              data={similarBooks}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[s.similarRow, index === similarBooks.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => { onClose(); onNavigate(item.id); }}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.cover_image }} style={s.similarImg} resizeMode="cover" />
                  <View style={s.similarInfo}>
                    <Text style={s.similarTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={s.similarAuthor} numberOfLines={1}>{item.author_name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <Text style={s.similarPrice}>{Number(item.price).toLocaleString("vi-VN")}đ</Text>
                      {item.original_price && Number(item.original_price) > Number(item.price) && (
                        <Text style={s.similarOldPrice}>{Number(item.original_price).toLocaleString("vi-VN")}đ</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.text3} />
                </TouchableOpacity>
              )}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Book cards ───────────────────────────────────────────────────────────────
function BookCardH({ item, onPress, onLongPress }: any) {
  return (
    <TouchableOpacity style={s.cardH} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.85}>
      <Image source={{ uri: item.cover_image }} style={s.cardHImg} resizeMode="cover" />
      <Text style={s.cardHTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={s.cardHAuthor} numberOfLines={1}>{item.author_name}</Text>
      <Text style={s.cardHPrice}>{Number(item.price).toLocaleString("vi-VN")}đ</Text>
      {item.original_price && Number(item.original_price) > Number(item.price) && (
        <Text style={s.cardHOldPrice}>{Number(item.original_price).toLocaleString("vi-VN")}đ</Text>
      )}
    </TouchableOpacity>
  );
}

function BookCardG({ item, onPress, onLongPress, showDiscount }: any) {
  return (
    <TouchableOpacity style={s.cardG} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.85}>
      <View style={{ position: "relative" }}>
        <Image source={{ uri: item.cover_image }} style={s.cardGImg} resizeMode="cover" />
        {showDiscount && item.discount_percent > 0 && (
          <View style={s.discountBadge}><Text style={s.discountBadgeTxt}>-{Math.round(item.discount_percent)}%</Text></View>
        )}
        <View style={s.longPressHint}>
          <Ionicons name="ellipsis-horizontal" size={12} color="#FFF" />
        </View>
      </View>
      <View style={s.cardGBody}>
        <Text style={s.cardGTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={s.cardGAuthor} numberOfLines={1}>{item.author_name || "Không rõ"}</Text>
        <Text style={s.cardGPrice}>{Number(item.price).toLocaleString("vi-VN")}đ</Text>
        {item.original_price && Number(item.original_price) > Number(item.price) && (
          <Text style={s.cardGOldPrice}>{Number(item.original_price).toLocaleString("vi-VN")}đ</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const [books, setBooks]                         = useState([]);
  const [categories, setCategories]               = useState([]);
  const [loadingBooks, setLoadingBooks]           = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryFilter, setCategoryFilter]       = useState(null);
  const [bestSellers, setBestSellers]             = useState([]);
  const [loadingBest, setLoadingBest]             = useState(true);
  const [topDiscounts, setTopDiscounts]           = useState([]);
  const [loadingDiscount, setLoadingDiscount]     = useState(true);
  const [allBooks, setAllBooks]                   = useState([]);
  const [page, setPage]                           = useState(1);
  const [hasMore, setHasMore]                     = useState(true);
  const [loadingMore, setLoadingMore]             = useState(false);

  // ── Recently viewed: reload khi focus lại màn hình
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);
  useFocusEffect(
    useCallback(() => {
      setRecentBooks(getRecentlyViewed(10));
    }, [])
  );
  const handleClearRecent = () => { clearRecentlyViewed(); setRecentBooks([]); };

  // ── Long-press → similar sheet (giữ nguyên flow cũ)
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const handleLongPress = (item: any) => { setSelectedBook(item); setSheetVisible(true); };

  // ==========================
  // DATA LOADING (all unchanged)
  // ==========================
  const loadBooks = async () => {
    if (categoryFilter === null) return;
    setLoadingBooks(true);
    try { const res = await api.get("/books", { params: { category: categoryFilter } }); setBooks(res.data); }
    catch (err) { console.log("Lỗi load sách:", err); }
    finally { setLoadingBooks(false); }
  };
  useEffect(() => { loadBooks(); }, [categoryFilter]);

  const loadCategories = async () => {
    try { const res = await api.get("/categories"); setCategories(res.data); }
    catch (err) { console.log("Lỗi load danh mục:", err); }
    finally { setLoadingCategories(false); }
  };
  useEffect(() => { loadCategories(); }, []);

  const loadBestSellers = async () => {
    try { const res = await api.get("/books/best-sellers"); setBestSellers(res.data); }
    catch (err) { console.log("Lỗi load best sellers:", err); }
    finally { setLoadingBest(false); }
  };
  useEffect(() => { loadBestSellers(); }, []);

  const loadTopDiscounts = async () => {
    try { const res = await api.get("/books/top-discount?limit=20"); setTopDiscounts(res.data); }
    catch (err) { console.log("Lỗi load top discounts:", err); }
    finally { setLoadingDiscount(false); }
  };
  useEffect(() => { loadTopDiscounts(); }, []);

  const loadAllBooks = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await api.get("/books", { params: { page, limit: 10 } });
      setTimeout(() => {
        if (res.data.length === 0) { setHasMore(false); }
        else {
          setAllBooks(prev => {
            const newList = res.data.filter((item: any) => !prev.some((b: any) => b.id === item.id));
            return [...prev, ...newList];
          });
          setPage(prev => prev + 1);
        }
        setLoadingMore(false);
      }, 1500);
    } catch (err) { console.log("Lỗi tải tất cả sách:", err); }
    finally { setLoadingMore(false); }
  };
  useEffect(() => { loadAllBooks(); }, []);

  const CAT_ICONS = ["book-outline","library-outline","school-outline","flask-outline","globe-outline","heart-outline","musical-notes-outline","code-slash-outline"];

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const close = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 20;
          if (close) loadAllBooks();
        }}
        scrollEventThrottle={400}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* ── HEADER ───────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerBlob1} /><View style={s.headerBlob2} />
          <View style={s.headerTop}>
            <View>
              <Text style={s.headerGreet}>Xin chào, {user?.username || "bạn"} 👋</Text>
              <Text style={s.headerBrand}>UTE Book Store</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={s.headerIconBtn}
                onPress={() => navigation.navigate("Cart")}
              >
                <Ionicons name="cart-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.headerIconBtn}>
                <Ionicons name="notifications-outline" size={22} color="#FFF" />
                <View style={s.notifDot} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("SearchScreen")} style={s.searchBar}>
            <Ionicons name="search-outline" size={19} color={C.text3} />
            <Text style={s.searchPlaceholder}>Tìm kiếm sách, tác giả...</Text>
            <View style={s.searchDivider} />
            <Ionicons name="filter-outline" size={17} color={C.primaryMid} />
          </TouchableOpacity>
        </View>

        {/* ── BANNER ───────────────────────────────────────────── */}
        <View style={s.banner}>
          <View style={{ flex: 1 }}>
            <View style={s.bannerTag}><Text style={s.bannerTagTxt}>⚡ Flash Sale</Text></View>
            <Text style={s.bannerTitle}>Giảm đến{"\n"}50%</Text>
            <Text style={s.bannerSub}>Áp dụng cho sinh viên UTE</Text>
            <TouchableOpacity style={s.bannerBtn} activeOpacity={0.85}>
              <Text style={s.bannerBtnTxt}>Mua ngay →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.bannerRight}>
            <View style={s.bannerCircle1} /><View style={s.bannerCircle2} />
            <Text style={{ fontSize: 72 }}>📚</Text>
          </View>
        </View>

        {/* ── 🕐 RECENTLY VIEWED — hiện ngay sau banner ────────── */}
        <RecentlyViewedSection
          items={recentBooks}
          onPress={id => navigation.navigate("BookDetail", { id })}
          onClear={handleClearRecent}
        />

        {/* ── CATEGORIES ───────────────────────────────────────── */}
        <SectionTitle title="Danh mục" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingBottom: 4 }} style={{ marginBottom: 4 }}>
          {loadingCategories ? <ActivityIndicator color={C.primaryMid} style={{ marginLeft: 8 }} /> :
            categories.map((cat: any, idx: number) => {
              const active = categoryFilter === cat.id;
              return (
                <TouchableOpacity key={cat.id} onPress={() => setCategoryFilter(active ? null : cat.id)}
                  activeOpacity={0.8} style={[s.catChip, active && s.catChipActive]}>
                  <View style={[s.catIconBox, active && s.catIconBoxActive]}>
                    <Ionicons name={CAT_ICONS[idx % CAT_ICONS.length] as any} size={22} color={active ? "#FFF" : C.primaryMid} />
                  </View>
                  <Text style={[s.catLabel, active && s.catLabelActive]} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        {categoryFilter && (
          <>
            <SectionTitle title="Sách thuộc danh mục" />
            {loadingBooks ? <ActivityIndicator color={C.primaryMid} style={{ margin: 20 }} /> :
              <FlatList data={books} numColumns={2} scrollEnabled={false}
                keyExtractor={(item: any) => item.id.toString()} columnWrapperStyle={s.gridRow}
                renderItem={({ item }: any) => <BookCardG item={item}
                  onPress={() => navigation.navigate("BookDetail", { id: item.id })}
                  onLongPress={() => handleLongPress(item)} showDiscount={false} />} />}
          </>
        )}

        {!categoryFilter && (
          <>
            <SectionTitle title="🏆 Top bán chạy nhất" />
            {loadingBest ? <ActivityIndicator color={C.primaryMid} style={{ margin: 20 }} /> :
              <FlatList data={bestSellers} horizontal keyExtractor={(item: any) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingVertical: 4 }}
                renderItem={({ item }: any) => <BookCardH item={item}
                  onPress={() => navigation.navigate("BookDetail", { id: item.id })}
                  onLongPress={() => handleLongPress(item)} />} />}
          </>
        )}

        <SectionTitle title="🔥 Giảm giá nhiều nhất" />
        {loadingDiscount ? <ActivityIndicator color={C.primaryMid} style={{ margin: 20 }} /> :
          <FlatList data={topDiscounts} numColumns={2} scrollEnabled={false}
            keyExtractor={(item: any) => item.id.toString()} columnWrapperStyle={s.gridRow}
            renderItem={({ item }: any) => <BookCardG item={item}
              onPress={() => navigation.navigate("BookDetail", { id: item.id })}
              onLongPress={() => handleLongPress(item)} showDiscount />} />}

        <SectionTitle title="📖 Tất cả sách" />
        <FlatList data={allBooks} numColumns={2} scrollEnabled={false}
          keyExtractor={(item: any, index: number) => item.id.toString() + index}
          columnWrapperStyle={s.gridRow}
          renderItem={({ item }: any) => <BookCardG item={item}
            onPress={() => navigation.navigate("BookDetail", { id: item.id })}
            onLongPress={() => handleLongPress(item)} showDiscount={false} />} />

        {loadingMore && (
          <View style={s.loadMoreBox}>
            <ActivityIndicator size="large" color={C.primaryMid} />
            <Text style={s.loadMoreTxt}>Đang tải thêm sách...</Text>
          </View>
        )}
      </ScrollView>

      <SimilarBooksSheet
        visible={sheetVisible}
        book={selectedBook}
        onClose={() => setSheetVisible(false)}
        onNavigate={id => navigation.navigate("BookDetail", { id })}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { backgroundColor: C.primaryMid, paddingTop: 12, paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" },
  headerBlob1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.08)", top: -70, right: -40 },
  headerBlob2: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.06)", bottom: -30, left: "40%" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerGreet: { fontSize: 13, color: "rgba(255,255,255,0.80)", marginBottom: 2 },
  headerBrand: { fontSize: 24, fontWeight: "800", color: "#FFF", letterSpacing: -0.5 },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF5252", borderWidth: 1.5, borderColor: C.primaryMid },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, gap: 8, elevation: 2, shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
  searchPlaceholder: { flex: 1, color: C.text3, fontSize: 14 },
  searchDivider: { width: 1, height: 18, backgroundColor: C.border, marginHorizontal: 4 },
  banner: { marginHorizontal: 16, marginTop: 18, backgroundColor: C.primary, borderRadius: 22, paddingVertical: 22, paddingLeft: 22, paddingRight: 8, flexDirection: "row", alignItems: "center", overflow: "hidden", elevation: 4, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14 },
  bannerTag: { backgroundColor: "rgba(255,255,255,0.20)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 },
  bannerTagTxt: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  bannerTitle: { fontSize: 28, fontWeight: "900", color: "#FFF", lineHeight: 34, marginBottom: 6 },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.78)", marginBottom: 14 },
  bannerBtn: { backgroundColor: "#FFF", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, alignSelf: "flex-start" },
  bannerBtnTxt: { color: C.primary, fontWeight: "800", fontSize: 13 },
  bannerRight: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  bannerCircle1: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.08)" },
  bannerCircle2: { position: "absolute", width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.10)", top: -10, right: 10 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.text1 },
  sectionMore:  { fontSize: 13, color: C.primaryMid, fontWeight: "600" },

  // ── Recently viewed
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  clearBtnTxt: { fontSize: 12, color: C.text3, fontWeight: "600" },
  recentCard: { width: 120, marginRight: 10, backgroundColor: C.surface, borderRadius: 14, padding: 8, elevation: 2, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  recentImg:    { width: "100%", height: 130, borderRadius: 10, marginBottom: 6 },
  recentTitle:  { fontSize: 12, fontWeight: "700", color: C.text1, marginBottom: 2, lineHeight: 16 },
  recentAuthor: { fontSize: 10, color: C.text3, marginBottom: 4 },
  recentPrice:  { fontSize: 13, fontWeight: "800", color: C.primaryMid },

  catChip: { alignItems: "center", marginRight: 14, width: 72 },
  catChipActive: {},
  catIconBox: { width: 58, height: 58, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center", marginBottom: 6, elevation: 2, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 4 },
  catIconBoxActive: { backgroundColor: C.primaryMid },
  catLabel: { fontSize: 11, color: C.text2, fontWeight: "600", textAlign: "center" },
  catLabelActive: { color: C.primaryMid },

  gridRow: { justifyContent: "space-between", paddingHorizontal: 16 },
  cardH: { width: 148, marginRight: 12, backgroundColor: C.surface, borderRadius: 18, padding: 10, elevation: 3, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 8 },
  cardHImg: { width: "100%", height: 148, borderRadius: 12, marginBottom: 8 },
  cardHTitle: { fontSize: 13, fontWeight: "700", color: C.text1, marginBottom: 2 },
  cardHAuthor: { fontSize: 11, color: C.text3, marginBottom: 4 },
  cardHPrice: { fontSize: 15, fontWeight: "800", color: C.primaryMid },
  cardHOldPrice: { fontSize: 11, color: C.text3, textDecorationLine: "line-through" },
  cardG: { width: "48%", backgroundColor: C.surface, borderRadius: 18, marginBottom: 14, overflow: "hidden", elevation: 3, shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 8 },
  cardGImg: { width: "100%", height: 168 },
  discountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: C.saleBadge, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  discountBadgeTxt: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  longPressHint: { position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.38)", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  cardGBody: { padding: 10 },
  cardGTitle: { fontSize: 13, fontWeight: "700", color: C.text1, marginBottom: 3 },
  cardGAuthor: { fontSize: 11, color: C.text3, marginBottom: 5 },
  cardGPrice: { fontSize: 15, fontWeight: "800", color: C.sale },
  cardGOldPrice: { fontSize: 11, color: C.text3, textDecorationLine: "line-through", marginTop: 1 },
  loadMoreBox: { paddingVertical: 36, alignItems: "center", gap: 10 },
  loadMoreTxt: { color: C.text3, fontSize: 13 },

  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.46)", justifyContent: "flex-end" },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "82%", paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 16 },
  sheetTriggerCard: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 14, backgroundColor: C.primarySoft, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: C.primaryTint },
  sheetTriggerImg: { width: 52, height: 72, borderRadius: 10 },
  sheetTriggerTitle: { fontSize: 14, fontWeight: "700", color: C.text1, marginBottom: 3 },
  sheetTriggerAuthor: { fontSize: 12, color: C.text3, marginBottom: 6 },
  sheetTriggerPrice: { fontSize: 15, fontWeight: "800", color: C.primaryMid },
  sheetViewBtn: { backgroundColor: C.primaryMid, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start" },
  sheetViewBtnTxt: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  sheetDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 8 },
  sheetDividerTxt: { fontSize: 13, fontWeight: "700", color: C.text2 } as any,
  similarRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: C.border },
  similarImg: { width: 52, height: 72, borderRadius: 10, backgroundColor: C.primarySoft },
  similarInfo: { flex: 1 },
  similarTitle: { fontSize: 14, fontWeight: "700", color: C.text1, marginBottom: 3 },
  similarAuthor: { fontSize: 12, color: C.text3 },
  similarPrice: { fontSize: 14, fontWeight: "800", color: C.sale },
  similarOldPrice: { fontSize: 11, color: C.text3, textDecorationLine: "line-through" },
  sheetEmpty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  sheetEmptyTxt: { fontSize: 14, color: C.text3 },
});