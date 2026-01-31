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
} from "react-native";
import { useRoute } from "@react-navigation/native";
import api from "../services/api";

const screenWidth = Dimensions.get("window").width;

export default function BookDetail() {
  const route = useRoute<any>();
  const { id } = route.params;

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, []);

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

        {/* Button */}
        <TouchableOpacity style={styles.btnAdd}>
          <Text style={styles.btnText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

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
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
  },

  author: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },

  sub: {
    fontSize: 15,
    color: "#666",
  },

  price: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: "bold",
    color: "#D62478",
  },

  section: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "justify",
    color: "#555",
  },

  btnAdd: {
    marginTop: 28,
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
