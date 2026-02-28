require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

// Khởi tạo Express App
const app = express();
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = process.env.URL_FE
  ? [process.env.URL_FE, "http://localhost:5173", "http://localhost:3000"]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (như mobile apps hoặc curl) hoặc thuộc whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Trong môi trường dev cho phép kết nối
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

// Đăng ký API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friend-request", friendRequestRoutes);
app.use("/api/chat", chatRoutes);

// Root health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "NexChat Realtime Backend API",
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
  console.log(`🚀 NexChat Server chạy tại http://localhost:${PORT}`);
});
