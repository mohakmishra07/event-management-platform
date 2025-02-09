const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user ID to request object
        next(); // Move to the next middleware
    } catch (err) {
        res.status(400).json({ msg: "Invalid token." });
    }
};

module.exports = authMiddleware;
