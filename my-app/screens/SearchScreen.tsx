import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import api from "../services/api";
import { getSearchHistory, saveSearchHistory } from "../services/searchHistory";
import db from "../services/database";

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

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, action, actionLabel }: {
  title: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <View style={s.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <View style={{ width: 3, height: 16, backgroundColor: C.primaryMid, borderRadius: 4 }} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={action}>
          <Text style={s.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SearchScreen({ navigation }: any) {
  const [keyword, setKeyword]       = useState("");
  const [history, setHistory]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // ==========================
  // LOGIC (unchanged)
  // ==========================
  const loadHistory = async () => {
    const data = await getSearchHistory();
    setHistory(data);
  };

  useEffect(() => { loadHistory(); }, []);

  const loadSuggestions = async (text: string) => {
    if (!text.trim()) { setSuggestions([]); return; }
    try {
      const res = await api.get("/books", { params: { search: text } });
      setSuggestions(res.data.slice(0, 8));
    } catch (err) { console.log("Lỗi gợi ý:", err); }
  };

  const handleSearch = () => {
    if (!keyword.trim()) return;
    saveSearchHistory(keyword);
    navigation.navigate("SearchResult", { keyword });
  };

  const clearHistory = async () => {
    await db.execAsync("DELETE FROM search_history");
    loadHistory();
  };

  const showSuggestions = suggestions.length > 0;
  const showHistory     = history.length > 0 && !showSuggestions;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryMid} />

      {/* ── HEADER + SEARCH BAR ─────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerBlob} />

        {/* top row: back + title */}
        <View style={s.headerTop}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Tìm kiếm</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* search input */}
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={19} color={C.primaryMid} />
          <TextInput
            autoFocus
            placeholder="Tìm tên sách, tác giả..."
            placeholderTextColor={C.text3}
            value={keyword}
            onChangeText={text => {
              setKeyword(text);
              loadSuggestions(text);
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={s.searchInput}
          />
          {keyword.length > 0 && (
            <TouchableOpacity
              onPress={() => { setKeyword(""); setSuggestions([]); }}
              style={s.clearBtn}
            >
              <Ionicons name="close-circle" size={18} color={C.text3} />
            </TouchableOpacity>
          )}
          {keyword.length > 0 && (
            <TouchableOpacity style={s.searchGoBtn} onPress={handleSearch}>
              <Text style={s.searchGoBtnTxt}>Tìm</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── SUGGESTIONS ─────────────────────────────────────── */}
        {showSuggestions && (
          <View style={s.section}>
            <SectionHeader title="Gợi ý tìm kiếm" />
            <View style={s.listCard}>
              {suggestions.map((item: any, idx: number) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.suggRow, idx === suggestions.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    saveSearchHistory(item.title);
                    navigation.navigate("SearchResult", { keyword: item.title });
                  }}
                  activeOpacity={0.75}
                >
                  <View style={s.suggIconWrap}>
                    <Ionicons name="book-outline" size={15} color={C.primaryMid} />
                  </View>
                  <Text style={s.suggTxt} numberOfLines={1}>{item.title}</Text>
                  <Ionicons name="arrow-forward-outline" size={15} color={C.text3} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── HISTORY ─────────────────────────────────────────── */}
        {showHistory && (
          <View style={s.section}>
            <SectionHeader
              title="Lịch sử tìm kiếm"
              action={clearHistory}
              actionLabel="Xóa tất cả"
            />
            <View style={s.listCard}>
              {(history as any[]).map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.histRow, idx === history.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setKeyword(item.keyword);
                    navigation.navigate("SearchResult", { keyword: item.keyword });
                  }}
                  activeOpacity={0.75}
                >
                  <View style={s.histIconWrap}>
                    <Ionicons name="time-outline" size={15} color={C.text3} />
                  </View>
                  <Text style={s.histTxt} numberOfLines={1}>{item.keyword}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setKeyword(item.keyword);
                      loadSuggestions(item.keyword);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="arrow-up-outline" size={15} color={C.text3} style={{ transform: [{ rotate: "45deg" }] }} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── EMPTY / IDLE STATE ──────────────────────────────── */}
        {!showSuggestions && !showHistory && (
          <View style={s.idleBox}>
            <View style={s.idleIconWrap}>
              <Ionicons name="search-outline" size={44} color={C.primaryTint} />
            </View>
            <Text style={s.idleTitle}>Tìm kiếm sách yêu thích</Text>
            <Text style={s.idleSub}>Nhập tên sách, tác giả hoặc từ khóa để bắt đầu</Text>

            {/* Quick search chips */}
            <View style={s.chipRow}>
              {["Văn học", "Kỹ năng", "Khoa học", "Kinh tế"].map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={s.chip}
                  onPress={() => {
                    setKeyword(tag);
                    loadSuggestions(tag);
                  }}
                >
                  <Text style={s.chipTxt}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 54,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    gap: 14,
  },
  headerBlob: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)", top: -60, right: -30,
  },
  headerTop: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },

  // Search bar
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.surface,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11,
    elevation: 3,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14, shadowRadius: 8,
  },
  searchInput: {
    flex: 1, fontSize: 15, color: C.text1,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  searchGoBtn: {
    backgroundColor: C.primaryMid, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  searchGoBtnTxt: { color: "#FFF", fontWeight: "800", fontSize: 13 },

  // ── Scroll
  scroll: { flex: 1 },

  // ── Section
  section: { padding: 16, paddingBottom: 0 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  sectionTitle:  { fontSize: 15, fontWeight: "800", color: C.text1 },
  sectionAction: { fontSize: 13, color: C.sale, fontWeight: "600" },

  // ── List card (shared wrapper)
  listCard: {
    backgroundColor: C.surface, borderRadius: 18,
    overflow: "hidden",
    elevation: 2,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },

  // Suggestion row
  suggRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderColor: C.border,
  },
  suggIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  suggTxt: { flex: 1, fontSize: 14, color: C.text1, fontWeight: "500" },

  // History row
  histRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderColor: C.border,
  },
  histIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: C.bg,
    justifyContent: "center", alignItems: "center",
  },
  histTxt: { flex: 1, fontSize: 14, color: C.text2 },

  // ── Idle / empty
  idleBox: {
    alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 10,
  },
  idleIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.primarySoft,
    justifyContent: "center", alignItems: "center",
    marginBottom: 4,
  },
  idleTitle: { fontSize: 18, fontWeight: "800", color: C.text1 },
  idleSub:   { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 21 },

  chipRow: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 8, marginTop: 10,
  },
  chip: {
    backgroundColor: C.surface, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: C.primaryTint,
    elevation: 1,
    shadowColor: C.primaryMid, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  chipTxt: { fontSize: 13, color: C.primaryMid, fontWeight: "700" },
});