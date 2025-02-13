import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateEvent = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const navigate = useNavigate();

    console.log("Rendering CreateEvent Component");

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You must be logged in to create an event.");
                return navigate("/login");
            }

            console.log("Sending Request:", { name, description, date, location });

            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/events`,
                { name, description, date, location },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Event Created Successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error creating event:", err);
            alert("Error creating event.");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create Event</h2>
            <form onSubmit={handleCreateEvent}>
                <div className="mb-3">
                    <label>Event Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label>Description</label>
                    <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label>Date</label>
                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label>Location</label>
                    <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-success">Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
