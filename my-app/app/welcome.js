import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function Welcome() {
  const { username, email } = useLocalSearchParams();

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* Ảnh Hello Kitty */}
        <Image
          source={{ uri: 'https://i.pinimg.com/474x/52/3a/4f/523a4f9b649b6138cd9520fe437e433a.jpg' }} 
          style={styles.kitty}
        />

        <Text style={styles.title}>Welcome Kitty! 💗</Text>
        <Text style={styles.subtitle}>Bạn đã đăng nhập thành công</Text>

        {username && (
          <View style={styles.infoBox}>
            <Text style={styles.label}>Xin chào,</Text>
            <Text style={styles.username}>{username} 🌸</Text>
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
          Chúc bạn có một ngày thật dễ thương cùng Hello Kitty! 🎀💞
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
    backgroundColor: '#ffb6d9', // hồng pastel
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  kitty: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff4f9a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ff77b7',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#ffe6f2',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: '#d681a9',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4f9a',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#d681a9',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#ff4f9a',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffd1e8',
    width: '100%',
    marginVertical: 20,
  },
  message: {
    fontSize: 14,
    color: '#d681a9',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#ff4f9a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ff4f9a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
