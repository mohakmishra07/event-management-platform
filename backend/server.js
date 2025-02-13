const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");  // ✅ Added bcrypt import
const User = require("./models/User"); // ✅ Added User model import (Adjust path if needed)
const mongoose = require("mongoose");
const SECRET_KEY = "your_very_secret_key";
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


// ✅ CORS Configuration (Only keeping specific origin, removed "*")
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());  // ✅ Moved before middleware to ensure body parsing

let attendees = {};

// ✅ Improved Authorization Header Handling
const identifyUser = (req, res, next) => {
    let token = req.headers.authorization;
    
    if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1]; // Extract actual token
    }

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                req.user = { role: "guest" };  // Treat as guest if token is invalid
            } else {
                req.user = { role: decoded.role };  // Assuming the decoded token contains a role
            }
            next();
        });
    } else {
        req.user = { role: "guest" };  // No token means guest access
        next();
    }
};

app.use(identifyUser);

// ✅ WebSocket Connection Handling
io.on("connection", (socket) => {
    console.log(`✅ New user connected: ${socket.id}`);

    socket.on("identify", (role) => {
        socket.role = role;
    });

    socket.on("joinEvent", (eventId) => {
        if (socket.role === "guest") {
            console.log(`Guest ${socket.id} viewing event ${eventId}`);
        } else {
            console.log(`🔵 User ${socket.id} joined event ${eventId}`);

            if (!attendees[eventId]) {
                attendees[eventId] = [];
            }

            if (!attendees[eventId].includes(socket.id)) {
                attendees[eventId].push(socket.id);
            }

            const attendeeCount = attendees[eventId].length;
            console.log(`📢 Emitting: { eventId: ${eventId}, count: ${attendeeCount} }`);
            io.emit("updateAttendees", { eventId: eventId, count: attendeeCount });
        }
    });

    // ✅ Handle User Disconnection
    socket.on("disconnect", () => {
        console.log(`❌ User ${socket.id} disconnected`);

        for (let eventId in attendees) {
            attendees[eventId] = attendees[eventId].filter((id) => id !== socket.id);
            const updatedCount = attendees[eventId].length;
            console.log(`📢 Emitting (disconnect): { eventId: ${eventId}, count: ${updatedCount} }`);
            io.emit("updateAttendees", { eventId: eventId, count: updatedCount });
        }
    });
});

// ✅ Fetch Events API
app.get("/api/events", (req, res) => {
    try {
        const events = [
            { _id: "67a919fe68dd00ee9535df92", name: "Tech Conference", location: "New York", public: true },
            { _id: "67a919fe68dd00ee9535df93", name: "Private Tech Workshop", location: "San Francisco", public: false }
        ];

        // ✅ Only show private events to logged-in users
        const filteredEvents = events.filter((event) =>
            req.user.role === "user" || event.public
        );

        const eventsWithAttendees = filteredEvents.map((event) => ({
            ...event,
            attendees: attendees[event._id] ? attendees[event._id].length : 0
        }));

        res.json(eventsWithAttendees);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ User Signup API
app.post("/api/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error signing up user:", error);
        res.status(500).json({ message: "Error signing up user: " + error.message });
    }
});
// ✅ User Login API
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ id: user._id, role: "user" }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// ✅ Start Server
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

server.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
