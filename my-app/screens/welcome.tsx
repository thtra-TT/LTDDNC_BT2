import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function WelcomeScreen({ navigation, route }: any) {
  const { username, email } = route.params || {};

  const handleLogout = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎉</Text>

        <Text style={styles.title}>Chào mừng!</Text>
        <Text style={styles.subtitle}>Đăng nhập thành công</Text>

        {username && (
          <View style={styles.infoBox}>
            <Text style={styles.label}>Xin chào,</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
        )}

        {email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email:</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.message}>
          Bạn đã đăng nhập thành công vào ứng dụng. Chúc bạn có trải nghiệm tuyệt vời!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD6E7", // Hồng pastel
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF0F6",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    shadowColor: "#FF8BB3",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#FFB6D9",
  },
  emoji: {
    fontSize: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4F9A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#D46A9E",
    marginBottom: 25,
  },
  infoBox: {
    backgroundColor: "#FFE6F2",
    borderRadius: 15,
    padding: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFB6D9",
  },
  label: {
    fontSize: 14,
    color: "#D46A9E",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF4F9A",
    marginTop: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#D46A9E",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#FF4F9A",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#FFB6D9",
    width: "100%",
    marginVertical: 20,
  },
  message: {
    textAlign: "center",
    color: "#D46A9E",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#FF5CA8",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF91C8",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
