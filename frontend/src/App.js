import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Event from "./pages/Event";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent"; // ✅ Import CreateEvent

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/event/:id" element={<Event />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-event" element={<CreateEvent />} />  {/* ✅ Ensure this route exists */}
            </Routes>
        </Router>
    );
};

export default App;
