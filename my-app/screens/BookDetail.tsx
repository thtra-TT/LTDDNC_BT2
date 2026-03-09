import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Phải có cái này
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import api from "../services/api"; // Đảm bảo đường dẫn api đúng với project của bạn

const screenWidth = Dimensions.get("window").width;

export default function BookDetail() {
    const { user } = useAuth();
  const route = useRoute<any>();
  const { id } = route.params;
  const [quantity, setQuantity] = useState(1);

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data);
    } catch (error) {
      console.log("❌ Lỗi tải sách:", error);
    } finally {
      setLoading(false);
    }
  };
    // --- Bước 2: Hàm tăng/giảm ---
      const increaseQty = () => {
        if (quantity < book.stock) {
          setQuantity(quantity + 1);
        } else {
          Alert.alert("Thông báo", "Đã đạt giới hạn tối đa trong kho.");
        }
      };

      const decreaseQty = () => {
        if (quantity > 1) {
          setQuantity(quantity - 1);
        }
      };

  // --- Logic Thêm Vào Giỏ Hàng ---
  const handleAddToCart = async () => {
     console.log(user.id);
    if (!book || book.stock <= 0) {
      Alert.alert("Thông báo", "Sản phẩm hiện đã hết hàng.");
      return;
    }

    try {
      // Gọi API POST tới backend đã tách controller trước đó
      const response = await api.post('/cart/add', {
        userId: user.id, // Tạm thời hardcode, sau này bạn thay bằng id từ AuthContext/Redux
        bookId: book.id,
        quantity: quantity // --- Bước 4: Gửi số lượng đã chọn ---
      });

      if (response.status === 200) {
        Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
      }
    } catch (error: any) {
      // Lấy message lỗi từ backend (ví dụ: "Vượt quá số lượng kho")
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      Alert.alert("Lỗi", errorMessage);
      console.error(error);
      console.log("❌ Lỗi API status:", error?.response?.status);
      console.log("❌ Full error:", error);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );

  if (!book)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sách</Text>
      </View>
    );

  const isOutOfStock = book.stock <= 0;

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh sách */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.cover_image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.card}>
        {/* Tiêu đề */}
        <Text style={styles.title}>{book.title}</Text>

        {/* Tác giả */}
        <Text style={styles.author}>Tác giả: {book.author_name}</Text>

        {/* Hiển thị trạng thái kho (Ghép từ đoạn 1) */}
        <View style={{ marginVertical: 8 }}>
          {isOutOfStock ? (
            <Text style={{ color: 'red', fontWeight: 'bold' }}>● Hết hàng</Text>
          ) : book.stock < 10 ? (
            <Text style={{ color: 'orange', fontWeight: '500' }}>● Chỉ còn {book.stock} sản phẩm (Sắp hết!)</Text>
          ) : (
            <Text style={{ color: 'green', fontWeight: '500' }}>● Còn hàng ({book.stock})</Text>
          )}
        </View>

        {/* Danh mục + NXB */}
        <Text style={styles.sub}>Danh mục: {book.category_name}</Text>
        <Text style={styles.sub}>NXB: {book.publisher_name}</Text>

        {/* Giá */}
        <Text style={styles.price}>
          {book.price.toLocaleString()} đ
        </Text>

        {/* Mô tả */}
        <Text style={styles.section}>Giới thiệu sách</Text>
        <Text style={styles.description}>{book.description}</Text>

        {/* --- GIAO DIỆN TĂNG GIẢM SỐ LƯỢNG --- */}
              {!isOutOfStock && (
                <View style={styles.quantityContainer}>
                  <Text style={styles.section}>Số lượng:</Text>
                  <View style={styles.quantityPicker}>
                    <TouchableOpacity onPress={decreaseQty} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyValue}>{quantity}</Text>

                    <TouchableOpacity onPress={increaseQty} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Button Thêm vào giỏ hàng */}
              <TouchableOpacity
                style={[styles.btnAdd, isOutOfStock && { backgroundColor: '#ccc' }]}
                onPress={handleAddToCart}
                disabled={isOutOfStock}
              >
                <Text style={styles.btnText}>
                  {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </Text>
              </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageContainer: {
    width: "100%",
    height: 380,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  image: {
    width: screenWidth * 0.65,
    height: 350,
    borderRadius: 14,
  },
  card: {
    marginTop: -20,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 6,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#222", marginBottom: 6 },
  author: { fontSize: 16, color: "#444", marginBottom: 4 },
  sub: { fontSize: 15, color: "#666" },
  price: { marginTop: 12, fontSize: 28, fontWeight: "bold", color: "#D62478" },
  section: { marginTop: 20, fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 22, textAlign: "justify", color: "#555" },
  btnAdd: {
    marginTop: 28,
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 15,
      backgroundColor: "#f9f9f9",
      padding: 10,
      borderRadius: 12,
    },
    quantityPicker: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 8,
      backgroundColor: "#fff",
    },
    qtyBtn: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: "#f0f0f0",
    },
    qtyBtnText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#6C63FF",
    },
    qtyValue: {
      paddingHorizontal: 20,
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
    },
});