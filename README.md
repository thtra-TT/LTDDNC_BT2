## Cách chạy dự án:
## 1. Clone dự án:
   ``` git clone ```  
   ## 2. Cấu hình API:
   Trong file app/services/api.js  
   
Sửa lại ```const YOUR_COMPUTER_IP = "IP_may_tinh";
baseURL: `http://${YOUR_COMPUTER_IP}:3000/api` ```  

Lấy IP_may_trinh bằng cách chạy lệnh ipconfig trong CMD

## 3. Backend
   ### Cài đặt thư viện backend:
   ``` cd backend ```
   ``` npm install ```  
   ### Chạy server backend:
   ``` node server.js ```  

   ## 4. Mobile App
   ### Cài đặt thư viện app:
   ``` cd ../my-app ```
   ``` npm install ```  
   ### Chạy ứng dụng:
   ``` npx expo start ```  

   Sau đó:
- Nhấn a → chạy Android emulator
- Nhấn w → chạy giao diện web
- Quét QR bằng điện thoại để chạy trên thiết bị thật

  
