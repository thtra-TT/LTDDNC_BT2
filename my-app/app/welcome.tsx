import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function WelcomeScreen() {
  const { username, email } = useLocalSearchParams<{ username: string; email: string }>();

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon chào mừng */}
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
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    marginVertical: 20,
  },
  message: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
