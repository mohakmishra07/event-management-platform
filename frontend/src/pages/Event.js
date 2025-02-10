import React from "react";
import { useParams } from "react-router-dom";

const Event = () => {
  const { id } = useParams();

  return (
    <div className="container mt-5">
      <h2 className="text-center">Event Details</h2>
      <p className="text-center">Event ID: {id}</p>
    </div>
  );
};

export default Event;
