import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, ScrollView, StyleSheet,
  StatusBar, Platform, ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

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
};

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: "relevant",   label: "Phù hợp nhất",  icon: "sparkles-outline" },
  { key: "low-high",   label: "Giá thấp → cao", icon: "trending-up-outline" },
  { key: "high-low",   label: "Giá cao → thấp", icon: "trending-down-outline" },
  { key: "newest",     label: "Mới nhất",        icon: "calendar-outline" },
  { key: "bestseller", label: "Bán chạy nhất",   icon: "flame-outline" },
];

// ─── Book card ────────────────────────────────────────────────────────────────
function BookCard({ item, onPress }: any) {
  return (
    <TouchableOpacity style={s.bookCard} onPress={onPress} activeOpacity={0.88}>
      <Image source={{ uri: item.cover_image }} style={s.bookImg} resizeMode="cover" />
      <View style={s.bookBody}>
        <Text style={s.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={s.bookAuthor} numberOfLines={1}>{item.author_name}</Text>
        <Text style={s.bookPrice}>{Number(item.price).toLocaleString("vi-VN")}đ</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SearchResultScreen({ route, navigation }: any) {
  const { keyword } = route.params;

  const [searchText, setSearchText]             = useState(keyword);
  const [books, setBooks]                       = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [sort, setSort]                         = useState("relevant");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ==========================
  // DATA LOGIC (unchanged)
  // ==========================
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/books", { params: { search: searchText } });
      let data  = [...res.data];

      if (sort === "low-high")  data.sort((a, b) => a.price - b.price);
      if (sort === "high-low")  data.sort((a, b) => b.price - a.price);
      if (sort === "newest")    data.sort((a, b) => b.id - a.id);

      setBooks(data);
    } catch (err) {
      console.log("Lỗi load search result:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setSearchText(keyword); }, [keyword]);
  useEffect(() => { loadData(); },            [searchText, sort]);

  const activeSort = SORT_OPTIONS.find(x => x.key === sort);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerBlob} />

        <View style={s.headerTop}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={17} color={C.primaryMid} />
            <TextInput
              style={s.searchInput}
              placeholder="Tìm tên sách, tác giả..."
              placeholderTextColor={C.text3}
              value={searchText}
              onChangeText={t => setSearchText(t)}
              onSubmitEditing={loadData}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={16} color={C.text3} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={s.goBtn} onPress={loadData}>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── FILTER BAR ───────────────────────────────────────── */}
        <View style={s.filterBar}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text style={s.resultNum}>{books.length}</Text>
            <Text style={s.resultLabel}>kết quả</Text>
          </View>

          {/* Sort dropdown trigger */}
          <View>
            <TouchableOpacity
              style={[s.sortBtn, showSortDropdown && s.sortBtnActive]}
              onPress={() => setShowSortDropdown(v => !v)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={activeSort?.icon as any}
                size={13}
                color={showSortDropdown ? "#FFF" : C.primaryMid}
              />
              <Text style={[s.sortBtnTxt, showSortDropdown && { color: "#FFF" }]}>
                {activeSort?.label}
              </Text>
              <Ionicons
                name={showSortDropdown ? "chevron-up" : "chevron-down"}
                size={13}
                color={showSortDropdown ? "#FFF" : C.primaryMid}
              />
            </TouchableOpacity>

            {showSortDropdown && (
              <View style={s.dropdown}>
                {SORT_OPTIONS.map((op, idx) => {
                  const active = op.key === sort;
                  return (
                    <TouchableOpacity
                      key={op.key}
                      style={[
                        s.dropdownItem,
                        active && s.dropdownItemActive,
                        idx === SORT_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => { setSort(op.key); setShowSortDropdown(false); }}
                    >
                      <Ionicons name={op.icon as any} size={14} color={active ? C.primaryMid : C.text3} />
                      <Text style={[s.dropdownTxt, active && s.dropdownTxtActive]}>{op.label}</Text>
                      {active && <Ionicons name="checkmark" size={14} color={C.primaryMid} style={{ marginLeft: "auto" as any }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* ── CONTENT ──────────────────────────────────────────── */}
        {loading ? (
          <View style={s.centerBox}>
            <ActivityIndicator size="large" color={C.primaryMid} />
            <Text style={{ color: C.text3, marginTop: 10, fontSize: 14 }}>Đang tìm kiếm...</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={s.centerBox}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="search-outline" size={44} color={C.primaryTint} />
            </View>
            <Text style={s.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={s.emptySub}>Thử từ khóa khác hoặc kiểm tra lại chính tả</Text>
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={s.gridRow}
            renderItem={({ item }) => (
              <BookCard
                item={item}
                onPress={() => navigation.navigate("BookDetail", { id: item.id })}
              />
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Header
  header: {
    backgroundColor: C.primaryMid,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 52,
    paddingBottom: 18, paddingHorizontal: 14,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerBlob: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)", top: -50, right: -30,
  },
  headerTop: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  searchBar: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.surface, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 9,
    elevation: 2,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10, shadowRadius: 4,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: C.text1, paddingVertical: 0,
  },
  goBtn: {
    width: 38, height: 38, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },

  scroll: { padding: 16, paddingBottom: 30 },

  // ── Filter bar
  filterBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  resultNum:   { fontSize: 22, fontWeight: "900", color: C.text1 },
  resultLabel: { fontSize: 13, color: C.text3 },

  sortBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: C.primaryTint,
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  sortBtnActive: { backgroundColor: C.primaryMid, borderColor: C.primaryMid },
  sortBtnTxt:    { fontSize: 13, color: C.primaryMid, fontWeight: "600" },

  dropdown: {
    position: "absolute", right: 0, top: 46, zIndex: 99,
    backgroundColor: C.surface, borderRadius: 16,
    width: 195,
    elevation: 12,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 14,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderColor: C.border,
  },
  dropdownItemActive: { backgroundColor: C.primarySoft },
  dropdownTxt:        { fontSize: 14, color: C.text2 },
  dropdownTxtActive:  { color: C.primaryMid, fontWeight: "700" },

  // ── Grid
  gridRow: { justifyContent: "space-between", gap: 12 },

  // ── Book card
  bookCard: {
    width: "48%",
    backgroundColor: C.surface, borderRadius: 18,
    marginBottom: 12, overflow: "hidden",
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09, shadowRadius: 8,
  },
  bookImg:    { width: "100%", height: 168 },
  bookBody:   { padding: 10, gap: 4 },
  bookTitle:  { fontSize: 13, fontWeight: "700", color: C.text1, lineHeight: 18 },
  bookAuthor: { fontSize: 11, color: C.text3 },
  bookPrice:  { fontSize: 15, fontWeight: "800", color: C.primaryMid, marginTop: 2 },

  // ── Center states
  centerBox: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: C.text1 },
  emptySub:   { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 21, paddingHorizontal: 24 },
});