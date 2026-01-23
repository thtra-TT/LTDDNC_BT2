const nodemailer = require('nodemailer');

/*
  ⚠️ HƯỚNG DẪN CẤU HÌNH EMAIL:
  
  1. Thay 'your-email@gmail.com' bằng email Gmail của bạn
  2. Thay 'your-app-password' bằng App Password (KHÔNG phải mật khẩu Gmail)
  
  📌 CÁCH LẤY APP PASSWORD:
  - Vào https://myaccount.google.com/security
  - Bật "2-Step Verification" (Xác minh 2 bước)
  - Tìm "App passwords" → Chọn "Mail" → Generate
  - Copy mật khẩu 16 ký tự (không có dấu cách)
*/

// ========== CẤU HÌNH EMAIL CỦA BẠN ==========
const EMAIL_USER = 'anhyeuem1phutthoi@gmail.com';
const EMAIL_PASS = 'aaxxnheoyzwmyehz';          // 👈 App Password KHÔNG có dấu cách
const EMAIL_FROM = 'My App <anhyeuem1phutthoi@gmail.com>';
// =============================================

// Tạo transporter với Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Kiểm tra kết nối email khi khởi động
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Lỗi cấu hình email:', error.message);
    console.log('💡 Kiểm tra lại EMAIL_USER và EMAIL_PASS trong config/email.js');
  } else {
    console.log('✅ Email server sẵn sàng gửi tin nhắn');
  }
});

// Hàm gửi OTP qua email
async function sendOTPEmail(toEmail, otp) {
  const mailOptions = {
    from: EMAIL_FROM,
    to: toEmail,
    subject: '🔐 Mã OTP Đặt Lại Mật Khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">🔐 Đặt Lại Mật Khẩu</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
          <p style="font-size: 16px; color: #333;">Xin chào,</p>
          <p style="font-size: 16px; color: #333;">Bạn đã yêu cầu đặt lại mật khẩu. Đây là mã OTP của bạn:</p>
          
          <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 10px; 
                      letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          
          <p style="font-size: 14px; color: #666;">⏰ Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
          <p style="font-size: 14px; color: #666;">🚫 Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Email này được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email OTP đã gửi thành công đến:', toEmail);
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOTPEmail };
