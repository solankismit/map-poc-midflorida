import React, { useEffect, useRef, useState } from "react";
import EventBus from "../../EventBus";
import { useData } from "../../DataContext";

export default function DataComponent() {
  const data = useData();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItemRef = useRef(null);

  const [openCardIndex, setOpenCardIndex] = useState(null);

  const handleItemClick = (id) => {
    setSelectedItemId(id);
    EventBus.emit("listItemClicked", id);
  };

  const handleMarkerClick = (id = 0) => {
    if (id === 0) {
      setSelectedItemId(null);
      return;
    }
    setSelectedItemId(id);
    setOpenCardIndex(data.findIndex((item) => item.id === id));
  };
  useEffect(() => {
    if (selectedItemRef.current) {
      setOpenCardIndex(data.findIndex((item) => item.id === selectedItemId));
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedItemId]);
  useEffect(() => {
    EventBus.on("markerClicked", handleMarkerClick);

    return () => {
      EventBus.off("markerClicked", handleMarkerClick);
    };
  }, []);

  return (
    <div className="data-component">
      <div className="data-items">
        {data.map((item, idx) =>
          DataItem({
            idx,
            item,
            selectedItemId,
            selectedItemRef,
            openCardIndex,
            onClick: () => {
              handleItemClick(item.id);
              setOpenCardIndex(openCardIndex === idx ? null : idx);
            },
          })
        )}
      </div>
    </div>
  );
}
const Icon = ({ name, className }) => {
  return <img src={`/${name}.png`} className={className} alt={name} />;
};
const DataItem = ({
  idx,
  item,
  selectedItemId,
  selectedItemRef,
  openCardIndex,
  onClick,
}) => {
  return (
    <div
      key={item.id}
      ref={selectedItemId === item.id ? selectedItemRef : null}
      className={`data-item  ${selectedItemId === item.id ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="weather ">
        <span className="weather-text s-body">
          <Icon name="thunderstorm" />
          Storm Hour Updates - Open until 2PM
        </span>
        <a href="#" className="weather-link m-body">
          <span>Read More</span> <Icon name="arrow-white" />
        </a>
      </div>
      <div className="branch-details">
        <div className="categories s-body">
          <p>{item.categories.join(" | ")}</p>
          <div className="branch-img">
            <img src="midflorida-img.png" alt="" />
          </div>
        </div>
        <div className="branch-name ">
          <span>{idx + 1}</span>
          <p className="branch-name--title l-body">{item.title}</p>
        </div>

        <p className="address m-body">
          {item.address} {item.zipcode}
        </p>
      </div>
      <div className="card">
        <div className="dropdown s-body">
          <span>
            {openCardIndex === idx ? "Less Information" : "Branch Hours"}
          </span>
          <Icon
            name={`arrow-up`}
            className={`icon ${openCardIndex === idx ? "opened" : ""}`}
          />
        </div>
        {openCardIndex === idx && (
          <div className="dropdown-content">
            <div className="features">
              <h3 className="s-label">Features</h3>
              <ul className="m-body">
                <li>7-7 Drive-Thru Service</li>
                <li>Safe Deposit Boxes</li>
                <li>Night Drop</li>
                <li>Business Services Available</li>
              </ul>
            </div>
            <div className="branch-hours">
              <h3 className="s-label">Branch Hours</h3>
              <ul className="m-body">
                <li>Mon - Fri: 7AM - 7PM</li>
                <li>Sat: 8:30AM - 1:30PM</li>
                <li>Sun: Closed</li>
                <li>ATM open 24 hours</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="place">
        <span className="s-body place-distance">2.4 miles |</span>
        <a href="#" className="m-body place-direction">
          <Icon name={"location"} />
          Get Directions
        </a>
        <a href="#" className="m-body place-details">
          <Icon name={"info"} />
          View Details
        </a>
        <a href="#" className="m-body place-wheel-chair">
          <Icon name={"wheelchair"} />
        </a>
      </div>
    </div>
  );
};
