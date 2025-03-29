import React from "react";
import "./carousal.scss";
import { Link } from "react-router-dom";

export default function Carousal({ props }) {
  return (
    <>
      <div className="card">
        <div className="event-image">
          <img src={props.image} alt="" />
        </div>
        <div className="event-content">
          <div className="event-title">
            <h3>{props.title}</h3>
          </div>
          <div className="event-duration">
            <h5>
              <span className="duration-label">Duration:</span> {props.duration}
            </h5>
          </div>
          <div className="event-type">
            <h5>Hiking</h5>
          </div>
          <div className="event-host">
            <h5>Host: {props.host}</h5>
          </div>
          <div className="event-capacity">
            <h5>Capacity: {props.capacity}</h5>
          </div>
          <Link to="/login" className="buttons">
            <button>Join</button>
          </Link>
        </div>
      </div>
    </>
  );
}
