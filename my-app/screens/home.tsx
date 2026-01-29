import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* USER INFO */}
        {user && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#D62478" }}>
              Xin chào, {user.username}
            </Text>
            <Text style={{ color: "#D46A9E" }}>{user.email}</Text>
          </View>
        )}

        {/* HEADER */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333" }}>
            UTE Book Store
          </Text>
          <Text style={{ fontSize: 16, color: "#666" }}>
            Tìm cuốn sách bạn yêu thích
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 12,
            flexDirection: "row",
            marginBottom: 25,
            alignItems: "center",
          }}
        >
          <TextInput
            placeholder="Tìm kiếm sách..."
            placeholderTextColor="#999"
            style={{ flex: 1, fontSize: 16 }}
          />
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </View>

        {/* BANNER */}
        <Image
          source={{
            uri: "https://img.ctykit.com/cdn/co-boulder/images/tr:w-1800/boulder-book-store-2022.jpg",
          }}
          style={{
            width: "100%",
            height: 170,
            borderRadius: 16,
            marginBottom: 25,
          }}
        />

        {/* DANH MỤC */}
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>
          Danh mục sách
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            "Tiểu thuyết",
            "Khoa học",
            "Kinh doanh",
            "Viễn tưởng",
            "Thiếu nhi",
            "Lịch sử",
          ].map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: "#6C63FF",
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 20,
                marginRight: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SÁCH NỔI BẬT */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 25,
            marginBottom: 15,
          }}
        >
          Sách nổi bật
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {[1, 2, 3, 4].map((_, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: "47%",
                backgroundColor: "#fff",
                padding: 10,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 3,
                marginBottom: 15, // thay gap
              }}
            >
              <Image
                source={{
                  uri: "https://product.hstatic.net/200000845405/product/ung-dung-ai-trong-cong-viec-bia-full_d7defa874ee04ab7bc683c9f81874be8_master.jpg",
                }}
                style={{
                  width: "100%",
                  height: 140,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />

              <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                Ứng dụng AI trong công việc
              </Text>
              <Text style={{ color: "#666", marginVertical: 3 }}>
                Sách kỹ thuật – công nghệ
              </Text>
              <Text style={{ color: "#6C63FF", fontWeight: "bold" }}>
                123.990 VNĐ
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
