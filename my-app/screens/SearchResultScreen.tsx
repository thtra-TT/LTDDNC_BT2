import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function SearchResultScreen({ route, navigation }) {
  const { keyword } = route.params;

  const [searchText, setSearchText] = useState(keyword);
  const [books, setBooks] = useState([]);

  // Bộ lọc
  const [sort, setSort] = useState("relevant");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortOptions = [
    { key: "relevant", label: "Phù hợp nhất" },
    { key: "low-high", label: "Giá thấp đến cao" },
    { key: "high-low", label: "Giá cao đến thấp" },
    { key: "newest", label: "Mới nhất" },
    { key: "bestseller", label: "Bán chạy nhất" },
  ];

  const formatPrice = (p) => Number(p).toLocaleString("vi-VN") + "đ";

  // Load dữ liệu
  const loadData = async () => {
    try {
      const res = await api.get("/books", {
        params: { search: searchText },
      });

      let data = [...res.data];

      if (sort === "low-high") data.sort((a, b) => a.price - b.price);
      if (sort === "high-low") data.sort((a, b) => b.price - a.price);
      if (sort === "newest") data.sort((a, b) => b.id - a.id);

      setBooks(data);
    } catch (err) {
      console.log("Lỗi load search result:", err);
    }
  };

  // Khi đổi từ khóa → load lại
  useEffect(() => {
    setSearchText(keyword);
  }, [keyword]);

  // Khi searchText hoặc sort thay đổi
  useEffect(() => {
    loadData();
  }, [searchText, sort]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH BAR */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            padding: 12,
            margin: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Ionicons name="search" size={20} color="#666" />

          <TextInput
            style={{ flex: 1, marginLeft: 10 }}
            placeholder="Tìm tên sách, tác giả..."
            value={searchText}
            onChangeText={(t) => setSearchText(t)}
            onSubmitEditing={loadData}
          />

          <TouchableOpacity onPress={loadData}>
            <Ionicons name="arrow-forward-circle" size={26} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        {/* SORT DROPDOWN */}
        <View style={{ marginTop: 5, marginRight: 16, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => setShowSortDropdown(!showSortDropdown)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 6 }}>
              {sortOptions.find((x) => x.key === sort)?.label}
            </Text>
            <Ionicons name="chevron-down" size={18} />
          </TouchableOpacity>

          {showSortDropdown && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                marginTop: 5,
                paddingVertical: 6,
                width: 160,
                elevation: 5,
              }}
            >
              {sortOptions.map((op) => (
                <TouchableOpacity
                  key={op.key}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                  }}
                  onPress={() => {
                    setSort(op.key);
                    setShowSortDropdown(false);
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* RESULT COUNT */}
        <Text
          style={{
            marginLeft: 16,
            marginTop: 10,
            color: "#777",
          }}
        >
          Tìm thấy {books.length} kết quả
        </Text>

        {/* GRID LIST */}
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                width: "48%",
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 10,
                marginTop: 16,
              }}
              onPress={() => navigation.navigate("BookDetail", { id: item.id })}
            >
              <Image
                source={{ uri: item.cover_image }}
                style={{
                  width: "100%",
                  height: 160,
                  borderRadius: 10,
                }}
              />

              <Text
                style={{ fontWeight: "bold", fontSize: 14, marginTop: 8 }}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Text style={{ fontSize: 12, color: "#999" }}>
                {item.author_name}
              </Text>

              <Text
                style={{
                  color: "#6C63FF",
                  fontWeight: "bold",
                  marginTop: 6,
                }}
              >
                {formatPrice(item.price)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </View>
  );
}