import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import api from "../services/api";
import { getSearchHistory, saveSearchHistory } from "../services/searchHistory";
import db from "../services/database";

export default function SearchScreen({ navigation }: any) {
  const [keyword, setKeyword] = useState("");
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const loadHistory = async () => {
    const data = await getSearchHistory();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await api.get("/books", { params: { search: text } });
      setSuggestions(res.data.slice(0, 8));
    } catch (err) {
      console.log("Lỗi gợi ý:", err);
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50 }}>
      {/* SEARCH BAR */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#eee",
          marginHorizontal: 15,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Ionicons name="search" size={20} color="#666" />

        <TextInput
          autoFocus
          placeholder="Tìm kiếm..."
          value={keyword}
          onChangeText={(text) => {
            setKeyword(text);
            loadSuggestions(text);
          }}
          onSubmitEditing={handleSearch}
          style={{ flex: 1, marginLeft: 8 }}
        />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* GỢI Ý */}
      {suggestions.length > 0 && (
        <View style={{ marginTop: 10, paddingHorizontal: 15 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Gợi ý</Text>

          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                saveSearchHistory(item.title);
                navigation.navigate("SearchResult", { keyword: item.title });
              }}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 0.5,
                borderColor: "#ddd",
              }}
            >
              <Text>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* LỊCH SỬ */}
      {history.length > 0 && suggestions.length === 0 && (
        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Lịch sử tìm kiếm</Text>

            <TouchableOpacity onPress={clearHistory}>
              <Text style={{ color: "red" }}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>

          {history.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setKeyword(item.keyword);
                navigation.navigate("SearchResult", {
                  keyword: item.keyword,
                });
              }}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 0.5,
                borderColor: "#ddd",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="time-outline" size={16} color="#555" />
              <Text style={{ marginLeft: 10 }}>{item.keyword}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}