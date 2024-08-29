import React, { useEffect, useRef, useState } from "react";
import EventBus from "../../EventBus";

export default function DataComponent() {
  const [data, setData] = useState([]);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItemRef = useRef(null);
  const dataApiUrl2 = import.meta.env.VITE_DATA_API_URL_2;

  function fetchData() {
    console.log("fetching data...");
    fetch(dataApiUrl2) // Replace with your actual API URL
      .then((response) => response.json())
      .then((data) => (data ? setData(data[0]["data"]) : setData([])))
      .catch((error) => console.error("Error fetching data:", error));
  }
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
    fetchData();
    EventBus.on("dataUpdated", fetchData);

    EventBus.on("markerClicked", handleMarkerClick);

    return () => {
      EventBus.off("dataUpdated", fetchData);
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
