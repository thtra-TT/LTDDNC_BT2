import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ username, email, password });

      Alert.alert('Thành công', 'Đăng ký thành công!');
      
      // Lưu user vào Redux store
      dispatch(setUser({ username, email }));

      // Chuyển đến trang welcome
      router.replace('/welcome');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', errorMessage);
      console.log('Register error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={COLORS.gray}
        value={username}
        onChangeText={setUsername}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.gray}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.gray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang xử lý..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 0.7,
    borderRadius: SIZES.radius * 0.6,
    marginBottom: SIZES.margin,
    fontSize: FONTS.sizes.md,
    ...SHADOWS.light,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding * 0.8,
    borderRadius: SIZES.radius * 0.6,
    alignItems: 'center',
    marginTop: SIZES.margin * 0.5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.secondaryLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  link: {
    textAlign: 'center',
    marginTop: SIZES.margin * 1.5,
    color: COLORS.secondary,
    fontSize: FONTS.sizes.sm,
  },
});
