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
import { FlatList } from "react-native";


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
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingBest, setLoadingBest] = useState(true);
  const [topDiscounts, setTopDiscounts] = useState([]);
  const [loadingDiscount, setLoadingDiscount] = useState(true);



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


    const loadBestSellers = async () => {
      try {
        const res = await api.get("/books/best-sellers");
        setBestSellers(res.data);
      } catch (err) {
        console.log("Lỗi load best sellers:", err);
      } finally {
        setLoadingBest(false);
      }
    };

    useEffect(() => {
      loadBestSellers();
    }, []);


    const loadTopDiscounts = async () => {
      try {
        const res = await api.get("/books/top-discount?limit=20");
        setTopDiscounts(res.data);
      } catch (err) {
        console.log("Lỗi load top discounts:", err);
      } finally {
        setLoadingDiscount(false);
      }
    };

    useEffect(() => {
      loadTopDiscounts();
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

        {/* TOP 10 BÁN CHẠY – chỉ hiển thị khi KHÔNG lọc danh mục */}
        {!categoryFilter && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Top 10 sách bán chạy nhất
              </Text>
            </View>

            {loadingBest ? (
              <Text style={{ marginLeft: 20 }}>Đang tải...</Text>
            ) : (
              <FlatList
                data={bestSellers}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingVertical: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      width: 150,
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 10,
                      marginRight: 15,
                      elevation: 3,
                    }}
                    onPress={() => navigation.navigate("BookDetail", { id: item.id })}
                  >
                    <Image
                      source={{ uri: item.cover_image }}
                      style={{ width: "100%", height: 140, borderRadius: 10 }}
                    />

                    <Text style={{ fontWeight: "bold", marginTop: 6 }} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={{ color: "#999", fontSize: 12 }}>
                      {item.author_name}
                    </Text>

                    <Text
                      style={{
                        color: "#6C63FF",
                        fontSize: 16,
                        fontWeight: "bold",
                        marginTop: 4,
                      }}
                    >
                      {Number(item.price).toLocaleString("vi-VN")}đ
                    </Text>

                    <Text
                      style={{
                        textDecorationLine: "line-through",
                        color: "#999",
                        fontSize: 12,
                      }}
                    >
                      {Number(item.original_price).toLocaleString("vi-VN")}đ
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}

        {/* 20 SẢN PHẨM GIẢM GIÁ CAO NHẤT */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 20,
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          Giảm giá nhiều nhất
        </Text>

        {loadingDiscount ? (
          <Text style={{ marginLeft: 20 }}>Đang tải...</Text>
        ) : (
          <FlatList
            data={topDiscounts}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  width: "48%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 15,
                  elevation: 3,
                }}
                onPress={() => navigation.navigate("BookDetail", { id: item.id })}
              >
                <Image
                  source={{ uri: item.cover_image }}
                  style={{
                    width: "100%",
                    height: 160,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                />

                <Text numberOfLines={2} style={{ fontWeight: "bold", fontSize: 14 }}>
                  {item.title}
                </Text>

                <Text style={{ color: "#999", fontSize: 12 }}>
                  {item.author_name || "Không rõ"}
                </Text>

                <Text
                  style={{
                    marginTop: 6,
                    color: "#E53935",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {Number(item.price).toLocaleString("vi-VN")}đ
                </Text>

                <Text
                  style={{
                    textDecorationLine: "line-through",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  {Number(item.original_price).toLocaleString("vi-VN")}đ
                </Text>

                <View
                  style={{
                    backgroundColor: "#E91E63",
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    marginTop: 5,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                    -{Math.round(item.discount_percent)}%
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
