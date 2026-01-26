import axios from 'axios';

// ⚠️ QUAN TRỌNG: Thay đổi IP này thành IP máy tính của bạn
// Điện thoại và máy tính phải cùng mạng Wi-Fi
const YOUR_COMPUTER_IP = '192.168.1.5';

const api = axios.create({
  baseURL: `http://${YOUR_COMPUTER_IP}:3000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

export default api;
