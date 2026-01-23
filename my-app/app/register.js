import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import api from '../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    if (!username || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const res = await api.post('/register', {
        username,
        email,
        password,
      });

      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace({
        pathname: '/welcome',
        params: {
          username,
          email,
        },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', errorMessage);
      console.log('Register error:', err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký</Text>

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

        <TouchableOpacity style={styles.button} onPress={register}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>

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
    backgroundColor: '#ffe6f1', // pastel hồng
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
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#d36fa3',
    marginBottom: 24,
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
