import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import api from '../services/api';

export default function RegisterScreen() {
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP + thông tin
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/register/send-otp', { email });
      Alert.alert('Thành công', res.data.message || 'OTP đã được gửi tới email');
      setStep(2);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh OTP và đăng ký
  const handleRegister = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 số');
      return;
    }

    if (!username) {
      Alert.alert('Lỗi', 'Vui lòng nhập username');
      return;
    }

    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', { 
        username, 
        email, 
        password, 
        otp 
      });
      Alert.alert('Thành công', 'Đăng ký thành công!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await api.post('/register/send-otp', { email });
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi!');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  // Quay lại
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Nhập email để nhận mã OTP' 
              : 'Nhập mã OTP và thông tin tài khoản'}
          </Text>

          {step === 1 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.emailInfo}>
                <Text style={styles.emailLabel}>Email: </Text>
                <Text style={styles.emailValue}>{email}</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Mã OTP (6 số)"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Đăng ký</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendOTP}
                disabled={loading}
              >
                <Text style={styles.resendText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>
              {step === 1 ? 'Đã có tài khoản? Đăng nhập' : 'Quay lại'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
  },
  emailInfo: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  emailLabel: {
    color: '#666',
  },
  emailValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#81C784',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  resendText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
});
