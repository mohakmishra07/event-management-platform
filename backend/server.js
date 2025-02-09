require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http"); // Required for WebSockets
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {
    cors: { origin: "*" } // Allow connections from all origins
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// WebSocket Handling
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinEvent", (eventId) => {
        console.log(`User joined event: ${eventId}`);
        io.emit("updateAttendees", { eventId }); // Notify all clients
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));

// Start Server (Use server instead of app for WebSockets)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
