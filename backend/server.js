const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_very_secret_key';
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

let attendees = {};
const identifyUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                req.user = { role: 'guest' };  // Treat as guest if token is invalid
            } else {
                req.user = { role: decoded.role };  // Assuming the decoded token includes the user role
            }
            next();
        });
    } else {
        req.user = { role: 'guest' };  // No token means guest access
        next();
    }
};

app.use(identifyUser);

io.on("connection", (socket) => {
    console.log(`✅ New user connected: ${socket.id}`);

    socket.on("identify", role => { 
        socket.role = role;
    });

    socket.on("joinEvent", (eventId) => {
        if (socket.role === 'guest') {
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

    // Log when a user disconnects
    socket.on("disconnect", () => {
        console.log(`❌ User ${socket.id} disconnected`);

        for (let eventId in attendees) {
            attendees[eventId] = attendees[eventId].filter(id => id !== socket.id);
            const updatedCount = attendees[eventId].length;
            console.log(`📢 Emitting (disconnect): { eventId: ${eventId}, count: ${updatedCount} }`);
            io.emit("updateAttendees", { eventId: eventId, count: updatedCount });
        }
    });
});

app.get("/api/events", (req, res) => {
    try {
        // Example data array with public/private distinction
        const events = [
            { _id: "67a919fe68dd00ee9535df92", name: "Tech Conference", location: "New York", public: true },
            { _id: "67a919fe68dd00ee9535df93", name: "Private Tech Workshop", location: "San Francisco", public: false }
        ]; 
  
        // Filter events based on role and public flag
        const filteredEvents = events.filter(event => 
          req.user.role === 'user' || event.public
        );
  
        const eventsWithAttendees = filteredEvents.map(event => ({
            ...event,
            attendees: attendees[event._id] ? attendees[event._id].length : 0
        }));
  
        res.json(eventsWithAttendees);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

server.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
