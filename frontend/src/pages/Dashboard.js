import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return alert("You must be logged in!");

                const res = await axios.get("https://event-management-backend-o93a.onrender.com/api/events", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEvents(res.data);
            } catch (err) {
                alert("Error fetching events");
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="container mt-5">
            <h2>Your Events</h2>
            <ul className="list-group">
                {events.map((event) => (
                    <li key={event._id} className="list-group-item">
                        {event.name} - {event.location}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
