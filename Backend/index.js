require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

// Khởi tạo Express App
const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = (process.env.URL_FE || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (curl, mobile) hoặc thuộc whitelist,
      // từ chối mọi origin không được khai báo trong URL_FE
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin không được phép bởi CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Tạo HTTP Server gắn Socket.IO
const server = http.createServer(app);
const { initSocket } = require("./src/socket/socket");
initSocket(server);

const PORT = process.env.PORT || 3002;

// Import Routes
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const friendRequestRoutes = require("./src/routes/friendRequest.routes");
const chatRoutes = require("./src/routes/chat.routes");
const uploadRoutes = require("./src/routes/upload.routes");

// Đăng ký API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friend-request", friendRequestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

// Root health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Bondly Social Realtime Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Kết nối MongoDB thành công");
  } catch (error) {
    console.log("❌ Kết nối MongoDB thất bại:", error.message);
  }
};
connectDB();

// Khởi động server
server.listen(PORT, () => {
  console.log(`🚀 Bondly Server chạy tại http://localhost:${PORT}`);
});
