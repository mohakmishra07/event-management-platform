const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router(); // ✅ Fix: Define Router

// Register User
router.post("/register", async (req, res) => {
    try {
        console.log("Received Request:", req.body); // Debugging log

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        console.log("Hashing password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("Creating new user...");
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        console.log("Generating token...");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("Registration successful!");
        res.json({ token, user: { id: user._id, name, email } });
    } catch (err) {
        console.error("Error in Register Route:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        console.log("Received Request:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log("Missing Fields:", { email, password });
            return res.status(400).json({ msg: "All fields are required" });
        }

        console.log("Checking if user exists in database...");
        const user = await User.findOne({ email });

        console.log("User Query Result:", user); // Debugging

        if (!user) {
            console.log("User not found:", email);
            return res.status(400).json({ msg: "User not found" });
        }

        console.log("Comparing passwords...");
        const isMatch = await bcrypt.compare(password, user.password);

        console.log("Password Match Result:", isMatch); // Debugging

        if (!isMatch) {
            console.log("Invalid password entered for:", email);
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        console.log("Generating JWT Token...");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("Login successful for:", email);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error("Error in Login Route:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
