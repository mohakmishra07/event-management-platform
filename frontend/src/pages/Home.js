import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://event-management-backend-o93a.onrender.com/api/events")
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center">Available Events</h1>
      {loading ? <p>Loading...</p> : (
        <div className="row">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{event.name}</h5>
                    <p className="card-text">{event.description}</p>
                    <p><strong>Date:</strong> {new Date(event.date).toDateString()}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <Link to={`/event/${event._id}`} className="btn btn-primary">View Details</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No events found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
