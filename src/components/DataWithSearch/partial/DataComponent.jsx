import React, { useEffect, useRef, useState } from "react";
import EventBus from "../../../EventBus";
import useFetchData from "../../../hooks/useFetchData";

export default function DataComponent() {
  const data = useFetchData();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItemRef = useRef(null);

  const handleItemClick = (id) => {
    setSelectedItemId(id);
    EventBus.emit("listItemClicked", id);
  };

  const handleMarkerClick = (id) => {
    setSelectedItemId(id);
  };
  useEffect(() => {
    if (selectedItemRef.current) {
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
      {data.map((item) => (
        <div
          key={item.id}
          ref={selectedItemId === item.id ? selectedItemRef : null}
          className={`data-item  ${
            selectedItemId === item.id ? "selected" : ""
          }`}
          onClick={() => handleItemClick(item.id)}
        >
          <h3>{item.title}</h3>
          <p>{item.address}</p>
          <p>{item.zipcode}</p>
          <p>{item.categories.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
