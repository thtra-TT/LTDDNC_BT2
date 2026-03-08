// Hàm tạo OTP 6 chữ số
exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Hàm validate email
exports.isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Hàm validate số điện thoại
exports.isValidPhone = (phone) => /^(0|\+84)[0-9]{9,10}$/.test(phone);

// Giả lập gửi SMS
exports.sendOTPPhone = (phone, otp) => {
  console.log(`📱 OTP cho SĐT ${phone}: ${otp}`);
};