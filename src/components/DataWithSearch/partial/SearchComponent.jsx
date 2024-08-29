import React, { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import EventBus from "../../../EventBus";
import { calculateDistance } from "../../../utils";

export default function SearchComponent() {
  const [searchResult, setSearchResult] = useState("");
  const updateData = async (selectedPlace, distance) => {
    try {
      const dataApiUrl1 = import.meta.env.VITE_DATA_API_URL;
      const dataApiUrl2 = import.meta.env.VITE_DATA_API_URL_2;
      const response1 = await fetch(dataApiUrl1, { method: "GET" });
      let data1 = await response1.json();

      if (data1) {
        if (typeof distance === "number") {
          let distances = [];
          // Filter data based on distance
          data1 = data1.filter((item) => {
            // Calculate distance between item and selected place
            const calculatedDistance = calculateDistance(
              item.location[0],
              item.location[1],
              selectedPlace.geometry.location.lat(),
              selectedPlace.geometry.location.lng()
            );
            distances.push(calculatedDistance);

            return calculatedDistance < distance;
            // Return true if distance is less than 50 miles
          });
        }
        const response2 = await fetch(dataApiUrl2 + "/data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: data1 }),
        });
      }
    } catch (error) {
      console.error("Error fetching or updating data:", error);
    }
    EventBus.emit("dataUpdated", selectedPlace?.geometry?.location);
  };

  const handlePlaceSelected = (place) => {
    updateData(place, 50);
  };

  function onLoad(autocomplete) {
    setSearchResult(autocomplete);
  }

  function onPlaceChanged() {
    if (searchResult != null) {
      if (searchResult !== "") {
        const place = searchResult.getPlace();
        handlePlaceSelected(place);
      }
    } else {
      alert("Please enter text");
    }
  }
  return (
    <div className="search-component">
      <h2>Find a Branch</h2>{" "}
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input type="text" placeholder="Search..." className="search-input" />
      </Autocomplete>
      <button className="search-button" onClick={updateData}>
        Reset Results
      </button>
    </div>
  );
}
