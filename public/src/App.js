import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import SetAvatar from "./components/SetAvatar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { host } from "./utils/APIRoutes"; // Ensure this is "http://34.205.146.14:5000"

export default function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Initialize socket with full URL and modern 2026 transport settings
    const newSocket = io(host, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // 2. Log connection for debugging in browser console
    newSocket.on("connect", () => {
      console.log("Connected to Socket Server:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    // 3. Cleanup on app close
    return () => newSocket.close();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setAvatar" element={<SetAvatar socket={socket} />} />
        {/* Pass the socket as a prop to the Chat component */}
        <Route path="/" element={<Chat socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}
