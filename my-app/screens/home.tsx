import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };




    const loadBooks = async () => {
      setLoadingBooks(true);

      try {
        let params: any = {};

        if (categoryFilter) {
          params.category = categoryFilter;
        }
        else if (search.trim() !== "") {
          params.search = search;
        }

        const res = await api.get("/books", { params });
        setBooks(res.data);

      } catch (err) {
        console.log("Lỗi load sách:", err);
      } finally {
        setLoadingBooks(false);
      }
    };

    const loadSuggestions = async (text) => {
      if (text.trim() === "") {
        setSuggestions([]);
        setShowSuggest(false);
        return;
      }

      try {
        const res = await api.get("/books", {
          params: { search: text }
        });

        // Chỉ lấy 5 gợi ý
        setSuggestions(res.data.slice(0, 5));
        setShowSuggest(true);
      } catch (err) {
        console.log("Lỗi gợi ý:", err);
      }
    };



  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.log("Lỗi load danh mục:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

    useEffect(() => {
      loadBooks();
    }, [search, categoryFilter]);

    useEffect(() => {
      loadCategories();
    }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View
          style={{
            backgroundColor: "#6C63FF",
            paddingVertical: 25,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "bold" }}>
            UTE Book Store
          </Text>
          <Text style={{ color: "#eee", marginBottom: 12 }}>
            Tri thức mới – Tương lai mới
          </Text>

          {/* SEARCH */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              borderRadius: 12,
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  placeholder="Tìm kiếm sách..."
                  style={{ marginLeft: 10, flex: 1 }}
                  placeholderTextColor="#999"
                  value={search}
                  onChangeText={(text) => {
                    setSearch(text);
                    loadSuggestions(text);
                  }}
                  onSubmitEditing={() => {
                    navigation.navigate("SearchResult", { keyword: search });
                    setShowSuggest(false);
                  }}
                />


          </View>
            </View>
            {showSuggest && suggestions.length > 0 && (
              <View
                style={{
                  backgroundColor: "#fff",
                  marginTop: 5,
                  borderRadius: 10,
                  padding: 10,
                  elevation: 5,
                }}
              >
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                        onPress={() => {
                          navigation.navigate("SearchResult", { query: item.title });
                          setShowSuggest(false);
                        }}

                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 0.5,
                      borderColor: "#eee",
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}


        {/* BANNER */}
        <View
          style={{
            margin: 20,
            padding: 20,
            backgroundColor: "#D62478",
            borderRadius: 18,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            FLASH SALE
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "bold",
              marginVertical: 5,
            }}
          >
            Giảm đến 50%
          </Text>
          <Text style={{ color: "#fff", marginBottom: 10 }}>
            Áp dụng cho sinh viên UTE
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              paddingVertical: 8,
              paddingHorizontal: 16,
              alignSelf: "flex-start",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#D62478", fontWeight: "bold" }}>
              Xem ngay
            </Text>
          </TouchableOpacity>
        </View>

        {/* DANH MỤC */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 20,
            marginBottom: 10,
          }}
        >
          Danh mục
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20, marginBottom: 10 }}
        >
          {loadingCategories ? (
            <Text>Đang tải...</Text>
          ) : (
            categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    if (categoryFilter === cat.id) setCategoryFilter(null);
                    else setCategoryFilter(cat.id);
                  }}
                  style={{
                    backgroundColor: categoryFilter === cat.id ? "#6C63FF" : "#fff",
                    width: 80,
                    height: 80,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                    borderRadius: 16,
                    elevation: 3,
                  }}
                >
                  <Ionicons
                    name="book-outline"
                    size={26}
                    color={categoryFilter === cat.id ? "#fff" : "#6C63FF"}
                  />
                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: categoryFilter === cat.id ? "#fff" : "#000",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>

            ))
          )}
        </ScrollView>

        {/* SÁCH NỔI BẬT */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Sách nổi bật</Text>

          <TouchableOpacity>
            <Text style={{ color: "#6C63FF" }}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* LIST SÁCH */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 20, marginTop: 10 }}
        >
          {loadingBooks ? (
            <Text>Đang tải...</Text>
          ) : (
            books.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  width: 160,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 12,
                  marginRight: 15,
                  elevation: 3,
                }}
                onPress={() =>
                  navigation.navigate("BookDetail", { id: item.id })
                }
              >
                <Image
                  source={{ uri: item.cover_image }}
                  style={{
                    width: "100%",
                    height: 150,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                />

                <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                  {item.title}
                </Text>
                <Text style={{ color: "#999", fontSize: 12 }}>
                  Tác giả: {item.author_name || item.author?.name || "Không rõ"}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#6C63FF",
                    fontWeight: "bold",
                    marginTop: 6,
                  }}
                >
                  {formatPrice(item.price)}
                </Text>

              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
