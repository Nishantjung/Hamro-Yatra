import React from "react";
import "./discover.scss";
import Carousal from "../carousel/Carousal";
export default function Discover() {
  const destinations = [
    {
      title: "Mustang Hiking Trip",
      duration: "11 days",
      host: "John Doe",
      capacity: "5",
      image: "images/carousal/carousal1.png",
    },
    {
      title: "Pokhara Biking ",
      duration: "4 days",
      host: "Richarlison",
      capacity: "8",
      image: "images/carousal/carousal2.png",
    },
    {
      title: "Bagpack",
      duration: "2 days",
      host: "Ayush Gautam",
      capacity: "3",
      image: "images/carousal/carousal3.png",
    },
    {
      title: "Chitwan ",
      duration: "2 days",
      host: "Suman Koirala",
      capacity: "6",
      image: "images/carousal/carousal4.png",
    },
  ];
  return (
    <>
      <div className="discover-container">
        <div className="discover-heading">
          <h1>Discover</h1>
        </div>
        <div className="active-indicator">
          <img src="images/Active Indicator.svg" alt="" />
        </div>
        <div className="carousal">
          {destinations.map((dest) => (
            <Carousal props={dest} />
          ))}
        </div>
      </div>
    </>
  );
}
