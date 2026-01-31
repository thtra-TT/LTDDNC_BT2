// import {
//   View,
//   Text,
//   TextInput,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useAuth } from "../hooks/useAuth";
//
// export default function HomeScreen({ navigation }: any) {
//   const { user } = useAuth();
//
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//
//
//
//         {/* USER INFO */}
//         {user && (
//           <View style={{ marginBottom: 20 }}>
//             <Text style={{ fontSize: 22, fontWeight: "bold", color: "#D62478" }}>
//               Xin chào, {user.username}
//             </Text>
//             <Text style={{ color: "#D46A9E" }}>{user.email}</Text>
//
//             {/* BUTTON PROFILE */}
//             <TouchableOpacity
//               onPress={() => navigation.navigate("ProfileTab")}
//               style={{
//                 marginTop: 10,
//                 backgroundColor: "#6C63FF",
//                 paddingVertical: 10,
//                 borderRadius: 10,
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
//                 Trang cá nhân
//               </Text>
//             </TouchableOpacity>
//
//           </View>
//         )}
//
//
//         {/* HEADER */}
//         <View style={{ marginBottom: 20 }}>
//           <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333" }}>
//             UTE Book Store
//           </Text>
//           <Text style={{ fontSize: 16, color: "#666" }}>
//             Tìm cuốn sách bạn yêu thích
//           </Text>
//         </View>
//
//         {/* SEARCH BAR */}
//         <View
//           style={{
//             backgroundColor: "#fff",
//             padding: 12,
//             borderRadius: 12,
//             flexDirection: "row",
//             marginBottom: 25,
//             alignItems: "center",
//           }}
//         >
//           <TextInput
//             placeholder="Tìm kiếm sách..."
//             placeholderTextColor="#999"
//             style={{ flex: 1, fontSize: 16 }}
//           />
//           <Text style={{ fontSize: 18 }}>🔍</Text>
//         </View>
//
//         {/* BANNER */}
//         <Image
//           source={{
//             uri: "https://img.ctykit.com/cdn/co-boulder/images/tr:w-1800/boulder-book-store-2022.jpg",
//           }}
//           style={{
//             width: "100%",
//             height: 170,
//             borderRadius: 16,
//             marginBottom: 25,
//           }}
//         />
//
//         {/* DANH MỤC */}
//         <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>
//           Danh mục sách
//         </Text>
//
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {[
//             "Tiểu thuyết",
//             "Khoa học",
//             "Kinh doanh",
//             "Viễn tưởng",
//             "Thiếu nhi",
//             "Lịch sử",
//           ].map((cat, index) => (
//             <TouchableOpacity
//               key={index}
//               style={{
//                 backgroundColor: "#6C63FF",
//                 paddingVertical: 10,
//                 paddingHorizontal: 18,
//                 borderRadius: 20,
//                 marginRight: 10,
//               }}
//             >
//               <Text style={{ color: "#fff", fontSize: 14 }}>{cat}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//
//         {/* SÁCH NỔI BẬT */}
//         <Text
//           style={{
//             fontSize: 20,
//             fontWeight: "bold",
//             marginTop: 25,
//             marginBottom: 15,
//           }}
//         >
//           Sách nổi bật
//         </Text>
//
//         <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
//           {[1, 2, 3, 4].map((_, index) => (
//             <TouchableOpacity
//               key={index}
//               style={{
//                 width: "47%",
//                 backgroundColor: "#fff",
//                 padding: 10,
//                 borderRadius: 12,
//                 shadowColor: "#000",
//                 shadowOpacity: 0.1,
//                 shadowRadius: 5,
//                 elevation: 3,
//                 marginBottom: 15, // thay gap
//               }}
//             >
//               <Image
//                 source={{
//                   uri: "https://product.hstatic.net/200000845405/product/ung-dung-ai-trong-cong-viec-bia-full_d7defa874ee04ab7bc683c9f81874be8_master.jpg",
//                 }}
//                 style={{
//                   width: "100%",
//                   height: 140,
//                   borderRadius: 8,
//                   marginBottom: 10,
//                 }}
//               />
//
//               <Text style={{ fontWeight: "bold", fontSize: 14 }}>
//                 Ứng dụng AI trong công việc
//               </Text>
//               <Text style={{ color: "#666", marginVertical: 3 }}>
//                 Sách kỹ thuật – công nghệ
//               </Text>
//               <Text style={{ color: "#6C63FF", fontWeight: "bold" }}>
//                 123.990 VNĐ
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
//
// import {
//   View,
//   Text,
//   TextInput,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuth } from "../hooks/useAuth";
//
// export default function HomeScreen({ navigation }: any) {
//   const { user } = useAuth();
//
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* HEADER */}
//         <View
//           style={{
//             backgroundColor: "#6C63FF",
//             paddingVertical: 25,
//             paddingHorizontal: 20,
//             borderBottomLeftRadius: 20,
//             borderBottomRightRadius: 20,
//           }}
//         >
//           <Text style={{ color: "#fff", fontSize: 26, fontWeight: "bold" }}>
//             UTE Book Store
//           </Text>
//           <Text style={{ color: "#eee", marginBottom: 12 }}>
//             Tri thức mới – Tương lai mới
//           </Text>
//
//           {/* SEARCH */}
//           <View
//             style={{
//               flexDirection: "row",
//               backgroundColor: "#fff",
//               borderRadius: 12,
//               alignItems: "center",
//               paddingHorizontal: 12,
//               paddingVertical: 10,
//             }}
//           >
//             <Ionicons name="search" size={20} color="#666" />
//             <TextInput
//               placeholder="Tìm kiếm sách..."
//               style={{ marginLeft: 10, flex: 1 }}
//               placeholderTextColor="#999"
//             />
//           </View>
//         </View>
//
//         {/* BANNER — NO GRADIENT */}
//         <View
//           style={{
//             margin: 20,
//             padding: 20,
//             backgroundColor: "#D62478",
//             borderRadius: 18,
//           }}
//         >
//           <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
//             FLASH SALE
//           </Text>
//           <Text
//             style={{
//               color: "#fff",
//               fontSize: 24,
//               fontWeight: "bold",
//               marginVertical: 5,
//             }}
//           >
//             Giảm đến 50%
//           </Text>
//           <Text style={{ color: "#fff", marginBottom: 10 }}>
//             Áp dụng cho sinh viên UTE
//           </Text>
//
//           <TouchableOpacity
//             style={{
//               backgroundColor: "#fff",
//               paddingVertical: 8,
//               paddingHorizontal: 16,
//               alignSelf: "flex-start",
//               borderRadius: 8,
//             }}
//           >
//             <Text style={{ color: "#D62478", fontWeight: "bold" }}>
//               Xem ngay
//             </Text>
//           </TouchableOpacity>
//         </View>
//
//         {/* DANH MỤC ICON */}
//         <Text
//           style={{
//             fontSize: 20,
//             fontWeight: "bold",
//             marginLeft: 20,
//             marginBottom: 10,
//           }}
//         >
//           Danh mục
//         </Text>
//
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ paddingLeft: 20, marginBottom: 10 }}
//         >
//           {[
//             { name: "Văn học", icon: "book" },
//             { name: "Kinh tế", icon: "briefcase" },
//             { name: "Công nghệ", icon: "hardware-chip-outline" },
//             { name: "Thiếu nhi", icon: "happy-outline" },
//             { name: "Kỹ năng", icon: "sparkles-outline" },
//           ].map((cat, index) => (
//             <View
//               key={index}
//               style={{
//                 backgroundColor: "#fff",
//                 width: 80,
//                 height: 80,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 marginRight: 15,
//                 borderRadius: 16,
//                 elevation: 3,
//               }}
//             >
//               <Ionicons name={cat.icon as any} size={26} color="#6C63FF" />
//               <Text style={{ marginTop: 5, fontSize: 12 }}>{cat.name}</Text>
//             </View>
//           ))}
//         </ScrollView>
//
//         {/* SÁCH NỔI BẬT */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             paddingHorizontal: 20,
//             marginTop: 10,
//           }}
//         >
//           <Text style={{ fontSize: 20, fontWeight: "bold" }}>
//             Sách nổi bật
//           </Text>
//
//           <TouchableOpacity>
//             <Text style={{ color: "#6C63FF" }}>Xem tất cả</Text>
//           </TouchableOpacity>
//         </View>
//
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ paddingLeft: 20, marginTop: 10 }}
//         >
//           {[1, 2, 3].map((item) => (
//             <View
//               key={item}
//               style={{
//                 width: 160,
//                 backgroundColor: "#fff",
//                 borderRadius: 16,
//                 padding: 12,
//                 marginRight: 15,
//                 elevation: 3,
//               }}
//             >
//               <Image
//                 source={{
//                   uri: "https://product.hstatic.net/200000845405/product/ung-dung-ai-trong-cong-viec-bia-full_d7defa874ee04ab7bc683c9f81874be8_master.jpg",
//                 }}
//                 style={{
//                   width: "100%",
//                   height: 150,
//                   borderRadius: 12,
//                   marginBottom: 8,
//                 }}
//               />
//
//               <Text style={{ fontWeight: "bold", fontSize: 14 }}>
//                 Ứng dụng AI trong công việc
//               </Text>
//               <Text style={{ color: "#999", fontSize: 12 }}>
//                 Sách kỹ thuật – công nghệ
//               </Text>
//
//               <Text
//                 style={{
//                   fontSize: 16,
//                   color: "#6C63FF",
//                   fontWeight: "bold",
//                   marginTop: 6,
//                 }}
//               >
//                 123.990 VNĐ
//               </Text>
//             </View>
//           ))}
//         </ScrollView>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
//


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

  const loadBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
    } catch (err) {
      console.log("Lỗi load sách:", err);
    } finally {
      setLoadingBooks(false);
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
            />
          </View>
        </View>

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
              <View
                key={cat.id}
                style={{
                  backgroundColor: "#fff",
                  width: 80,
                  height: 80,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 15,
                  borderRadius: 16,
                  elevation: 3,
                }}
              >
                <Ionicons name="book-outline" size={26} color="#6C63FF" />
                <Text style={{ marginTop: 5, fontSize: 12 }}>{cat.name}</Text>
              </View>
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
                  Tác giả ID: {item.author_id}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: "#6C63FF",
                    fontWeight: "bold",
                    marginTop: 6,
                  }}
                >
                  {item.price} VNĐ
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
