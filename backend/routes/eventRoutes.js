const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Event = require("../models/Event");

const router = express.Router();

// Create an event (Protected)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, description, date, location } = req.body;

        if (!name || !date || !location) {
            return res.status(400).json({ msg: "Name, date, and location are required." });
        }

        const event = new Event({
            user: req.user.id,
            name,
            description,
            date,
            location
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// Get all events (Public)
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().populate("user", "name email");
        res.json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// Update an event (Protected)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: "Event not found" });
        }

        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Unauthorized to edit this event" });
        }

        const { name, description, date, location } = req.body;
        event.name = name || event.name;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;

        await event.save();
        res.json(event);
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// Delete an event (Protected)
// Delete an event (Protected)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: "Event not found" });
        }

        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Unauthorized to delete this event" });
        }

        await Event.deleteOne({ _id: req.params.id }); // ✅ Correct method

        res.json({ msg: "Event deleted" });
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});
// User joins an event (Protected)
router.post("/:id/join", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: "Event not found" });
        }

        // Check if user is already an attendee
        if (event.attendees.includes(req.user.id)) {
            return res.status(400).json({ msg: "You are already attending this event" });
        }

        event.attendees.push(req.user.id);
        await event.save();

        // Emit real-time update to all clients
        io.emit("updateAttendees", { eventId: event._id, attendees: event.attendees });

        res.json({ msg: "Joined event successfully", event });
    } catch (err) {
        console.error("Error joining event:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
