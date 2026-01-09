const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
require("dotenv").config();

// Route Imports (Ensure these paths match your project structure)
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();

// 1. CORS Configuration for standard HTTP requests (Axios)
app.use(cors({
  origin: "http://34.205.146.14:3000",
  credentials: true
}));

app.use(express.json());

// 2. Database Connection
mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.error("DB Connection Error:", err.message);
  });

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 4. Server Initialization
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// 5. Socket.io Configuration for WebSockets
// This specifically fixes the "0B transferred / transport polling" error
const io = socket(server, {
  cors: {
    origin: "http://34.205.146.14:3000", // Your Frontend EC2 Address
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 6. Chat Logic (Socket Events)
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  
  // When a user logs in, map their ID to the socket ID
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);
  });

  // Handle sending messages
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
