# NexChat Realtime - Nền Tảng Nhắn Tin Thời Gian Thực & Mạng Xã Hội

NexChat là hệ thống ứng dụng nhắn tin thời gian thực (Real-time Chat & Social Messaging Platform) tốc độ cao, được thiết kế theo kiến trúc Client-Server hiện đại. Ứng dụng cung cấp khả năng truyền tải dữ liệu hai chiều tức thì với độ trễ cực thấp (< 30ms) qua giao thức WebSocket (Socket.IO), bảo mật xác thực JWT và giao diện người dùng Cyber Messenger tinh tế.

---

## 🌟 Tính Năng Nổi Bật

### 1. Trải Nghiệm Nhắn Tin Thời Gian Thực (Socket.IO Realtime Engine)
- **Gửi & Nhận tin nhắn tức thì:** Truyền tải thông điệp hai chiều với độ trễ tiệm cận 0.
- **Trạng thái Trực tuyến (Online/Offline Presence):** Theo dõi danh sách người dùng và bạn bè đang online theo thời gian thực.
- **Hiệu ứng Đang gõ phím (Live Typing Indicator):** Hiển thị trạng thái "Người dùng đang soạn tin nhắn..." mượt mà.
- **Trạng thái Đã xem (Read Receipts):** Đánh dấu tin nhắn đã gửi (1 tick) và đã đọc (2 tick) trực quan.
- **Thu hồi tin nhắn (Message Recall):** Cho phép người gửi thu hồi tin nhắn đã gửi trên cả 2 đầu thiết bị.
- **Thả cảm xúc Emoji (Reactions):** Thả cảm xúc tương tác (❤️, 👍, 😂, 🔥, 🎉) trực tiếp trên từng bong bóng tin nhắn.
- **Chia sẻ hình ảnh & Tệp tin:** Hỗ trợ gửi ảnh preview đính kèm tin nhắn.
- **Âm thanh thông báo tự động:** Phát âm thanh thông báo Web Audio API khi có tin nhắn mới đến.

### 2. Quản Lý Bạn Bè & Mạng Xã Hội (Social & Friendship System)
- **Tìm kiếm bạn bè:** Tìm kiếm người dùng nhanh chóng theo họ tên, username hoặc email.
- **Vòng đời Lời mời kết bạn:** Gửi lời mời, chấp nhận, từ chối hoặc hủy yêu cầu đã gửi.
- **Quản lý Danh bạ bạn bè:** Xem danh sách bạn bè, thông tin chi tiết (bio, email, phone) và hủy kết bạn an toàn.

### 3. Xác Thực & Bảo Mật Hệ Thống (Auth & Security)
- **Đăng ký & Xác thực OTP qua Email:** Tích hợp Nodemailer gửi mã OTP 6 số để kích hoạt tài khoản.
- **Đăng nhập & Phiên làm việc:** Xác thực an toàn với JSON Web Token (JWT) và Cookie HttpOnly.
- **Khử nhiễu & Phân luồng dữ liệu:** MongoDB Schema Indexing tối ưu hóa tốc độ truy vấn lịch sử chat.

### 4. Giao Diện Người Dùng & Trải Nghiệm (UI/UX)
- **Cyber Dark & Clean Light Theme:** Chuyển đổi linh hoạt 2 chế độ giao diện hiện đại.
- **Thiết kế Responsive:** Tương thích trên cả máy tính bàn và màn hình thu nhỏ.
- **Micro-animations & Glassmorphism:** Hiệu ứng làm mờ nền kính và chuyển động mượt mà.

---

## 🛠 Công Nghệ Sử Dụng

### Backend Architecture
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Realtime Engine:** Socket.IO Server (`v4.8.1`)
- **Database & ODM:** MongoDB & Mongoose
- **Authentication:** JSON Web Token (`jsonwebtoken`), `bcrypt`
- **Email Service:** Nodemailer (SMTP Transport)

### Frontend Client
- **Core Library:** React 18 SPA
- **Build Tool:** Vite 6
- **Realtime Client:** `socket.io-client`
- **Router:** React Router DOM v6
- **Iconography:** Lucide React
- **Styling:** Vanilla CSS Custom Properties & Glassmorphism Design System

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
SocialMedia/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Bộ điều khiển xử lý logic nghiệp vụ (Auth, Chat, Friend, User)
│   │   ├── middlewares/      # Middleware xác thực JWT và phân quyền
│   │   ├── models/           # Mongoose Data Models (User, Message, Conversation, FriendRequest)
│   │   ├── routes/           # RESTful API Endpoints
│   │   ├── services/         # Tầng dịch vụ xử lý dữ liệu và logic CSDL
│   │   ├── socket/           # Socket.IO Realtime Engine & Event Handlers
│   │   └── utils/            # Tiện ích phản hồi API & gửi email OTP
│   ├── index.js              # Entry point khởi chạy HTTP + Socket Server
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/              # HTTP Client cấu hình Headers và Token
│   │   ├── components/       # UI Components (Sidebar, ChatArea, ProfileDrawer, Modals)
│   │   ├── context/          # State Management (AuthContext, SocketContext, ThemeContext)
│   │   ├── pages/            # Các trang giao diện (ChatPage, LoginPage, RegisterPage, VerifyEmailPage)
│   │   ├── styles/           # Design System & Cyber Theme CSS
│   │   ├── App.jsx           # Routing & Route Guards
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Cài đặt Backend
```bash
cd Backend
npm install

# Tạo file .env và điền các thông số:
# PORT=3002
# MONGO_URL=mongodb+srv://...
# JWT_SECRET=your_secret_key
# URL_FE=http://localhost:5174
# EMAIL_USER=...
# EMAIL_PASS=...

npm run dev
```

### 2. Cài đặt Frontend
```bash
cd Frontend
npm install
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:5174`

---

## 👨‍💻 Tác Giả & Bản Quyền
- **Lập trình viên:** Nguyễn Trung Nguyên (Nguyenne.dev)
- **Email:** nguyenne.dev@gmail.com
- **Portfolio:** [https://nguyenne.pro.vn](https://nguyenne.pro.vn)
