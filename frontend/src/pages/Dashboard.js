import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://event-management-backend-o93a.onrender.com"); 

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("You must be logged in!");
                    return;
                }
    
                console.log("Fetching events...");
                const res = await axios.get("https://event-management-backend-o93a.onrender.com", {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                console.log("Events received:", res.data);
                if (!res.data || res.data.length === 0) {
                    console.warn("No events found in the backend.");
                }
    
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching events:", err);
                alert("Error fetching events");
            }
        };
    
        fetchEvents();
    }, []);
    

    useEffect(() => {
        socket.on("updateAttendees", (data) => {
            console.log("Raw data received from WebSocket:", data);

            if (data && data.eventId && typeof data.count === "number") {
                setEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event._id === data.eventId ? { ...event, attendees: data.count } : event
                    )
                );
            } else {
                console.warn("Invalid WebSocket data format:", data);
            }
        });

        return () => {
            socket.off("updateAttendees");
        };
    }, []);

    const handleJoinEvent = (eventId) => {
        console.log(`Attempting to join event: ${eventId}`);
        socket.emit("joinEvent", eventId);
    };

    return (
        <div className="container mt-5">
            <h2>Your Events</h2>
            <ul className="list-group">
                {events.length === 0 ? (
                    <p>No events available.</p>
                ) : (
                    events.map((event) => (
                        <li key={event._id} className="list-group-item">
                            <strong>{event.name}</strong> - {event.location} <br />
                            <strong>Attendees:</strong> {event.attendees || 0} <br />
                            <button className="btn btn-primary mt-2" onClick={() => handleJoinEvent(event._id)}>
                                Join Event
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default Dashboard;
