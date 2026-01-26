//import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
//import { router } from 'expo-router';
//import { useState } from 'react';
//import api from '../services/api';
//
//export default function Register() {
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [password, setPassword] = useState('');
//
//  const register = async () => {
//    if (!username || !email || !password) {
//      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
//      return;
//    }
//
//    try {
//      const res = await api.post('/register', {
//        username,
//        email,
//        password,
//      });
//
//      Alert.alert('Thành công', 'Đăng ký thành công!');
//      router.replace({
//        pathname: '/welcome',
//        params: {
//          username,
//          email,
//        },
//      });
//    } catch (err) {
//      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại';
//      Alert.alert('Lỗi', errorMessage);
//      console.log('Register error:', err.response?.data || err.message);
//    }
//  };
//
//  return (
//    <View style={styles.container}>
//      <View style={styles.card}>
//        <Text style={styles.title}>Đăng ký</Text>
//
//        <TextInput
//          style={styles.input}
//          placeholder="Username"
//          placeholderTextColor="#d39acb"
//          value={username}
//          onChangeText={setUsername}
//        />
//
//        <TextInput
//          style={styles.input}
//          placeholder="Email"
//          placeholderTextColor="#d39acb"
//          value={email}
//          onChangeText={setEmail}
//        />
//
//        <TextInput
//          style={styles.input}
//          placeholder="Password"
//          placeholderTextColor="#d39acb"
//          secureTextEntry
//          value={password}
//          onChangeText={setPassword}
//        />
//
//        <TouchableOpacity style={styles.button} onPress={register}>
//          <Text style={styles.buttonText}>Đăng ký</Text>
//        </TouchableOpacity>
//
//        <TouchableOpacity onPress={() => router.replace('/login')}>
//          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
//        </TouchableOpacity>
//      </View>
//    </View>
//  );
//}
//
///* ===== STYLE: Hello Kitty Pastel ===== */
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    backgroundColor: '#ffe6f1', // pastel hồng
//    justifyContent: 'center',
//    alignItems: 'center',
//    padding: 24,
//  },
//
//  card: {
//    width: '100%',
//    backgroundColor: '#fff0f7',
//    borderRadius: 20,
//    padding: 25,
//    elevation: 10,
//    shadowColor: '#ffb6d9',
//    shadowOpacity: 0.4,
//    shadowRadius: 10,
//    borderWidth: 2,
//    borderColor: '#ffb6d9',
//  },
//
//  title: {
//    fontSize: 30,
//    fontWeight: 'bold',
//    textAlign: 'center',
//    color: '#ff69b4',
//    marginBottom: 6,
//  },
//
//  subtitle: {
//    fontSize: 16,
//    textAlign: 'center',
//    color: '#d36fa3',
//    marginBottom: 24,
//  },
//
//  input: {
//    backgroundColor: '#ffe6f5',
//    padding: 14,
//    borderRadius: 12,
//    marginBottom: 16,
//    fontSize: 16,
//    borderWidth: 2,
//    borderColor: '#ffb6d9',
//    color: '#d63384',
//  },
//
//  button: {
//    backgroundColor: '#ff6fb5',
//    padding: 15,
//    borderRadius: 12,
//    alignItems: 'center',
//    marginTop: 8,
//    borderWidth: 2,
//    borderColor: '#ffb6d9',
//  },
//
//  buttonText: {
//    color: '#fff',
//    fontSize: 18,
//    fontWeight: 'bold',
//  },
//
//  link: {
//    textAlign: 'center',
//    marginTop: 18,
//    color: '#ff4fa3',
//    fontSize: 15,
//    fontWeight: 'bold',
//  },
//});


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import api from '../services/api';

export default function Register() {
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  /* ========== STEP 1: SEND OTP ========== */
  const sendOTP = async () => {
    if (!username || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await api.post('/register/send-otp', { email });
      Alert.alert('Thành công', 'OTP đã được gửi đến email của bạn');
      setStep(2);
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể gửi OTP');
    }
  };

  /* ========== STEP 2: VERIFY & REGISTER ========== */
  const register = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }

    try {
      await api.post('/register', {
        username,
        email,
        password,
        otp,
      });

      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace({
        pathname: '/welcome',
        params: { username, email },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký</Text>

        {/* STEP 1: USERNAME + EMAIL + PASSWORD */}
        {step === 1 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#d39acb"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#d39acb"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#d39acb"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={sendOTP}>
              <Text style={styles.buttonText}>Gửi OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 2 && (
          <>
            <Text style={styles.subtitle}>Mã OTP đã gửi đến email:</Text>
            <Text style={styles.emailText}>{email}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              placeholderTextColor="#d39acb"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.button} onPress={register}>
              <Text style={styles.buttonText}>Xác nhận & Đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={sendOTP}>
              <Text style={styles.link}>Gửi lại OTP</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===== STYLE: Hello Kitty Pastel ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffe6f1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    backgroundColor: '#fff0f7',
    borderRadius: 20,
    padding: 25,
    elevation: 10,
    shadowColor: '#ffb6d9',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#ffb6d9',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ff69b4',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#d36fa3',
  },

  emailText: {
    textAlign: 'center',
    color: '#ff4fa3',
    marginBottom: 20,
    fontWeight: 'bold',
  },

  input: {
    backgroundColor: '#ffe6f5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#ffb6d9',
    color: '#d63384',
  },

  button: {
    backgroundColor: '#ff6fb5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#ffb6d9',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  link: {
    textAlign: 'center',
    marginTop: 18,
    color: '#ff4fa3',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
