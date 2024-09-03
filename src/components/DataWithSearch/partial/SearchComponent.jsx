import React, { useEffect, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import EventBus from "../../../EventBus";
import { useNavigate } from "react-router-dom";

const categories = ["ATM", "Bank", "Credit Union"];

export default function SearchComponent() {
  const [autocompleteInstance, setAutocompleteInstance] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [distance, setDistance] = useState("50");
  const navigate = useNavigate();

  const handlePlaceSelected = (place) => {
    // Insert it in URL Query
    const url = new URL(window.location.href);
    if (place && place.geometry && place.geometry.location) {
      // url.searchParams.set("place", place.formatted_address);
      url.searchParams.set("lat", place?.geometry?.location?.lat());
      url.searchParams.set("lon", place?.geometry?.location?.lng());
    } else {
      url.searchParams.delete("lat");
      url.searchParams.delete("lon");
    }

    if (selectedCategories.length > 0) {
      url.searchParams.set("categories", selectedCategories.join(","));
    } else {
      url.searchParams.delete("categories");
    }
    if (place && place.geometry && place.geometry.location && distance > 0) {
      url.searchParams.set("distance", distance);
    } else {
      url.searchParams.delete("distance");
    }
    navigate(url.pathname + url.search);
  };

  function onLoad(autocomplete) {
    setAutocompleteInstance(autocomplete);
  }

  function onPlaceChanged() {
    EventBus.emit("resetMap");
    if (autocompleteInstance != null) {
      if (autocompleteInstance !== "") {
        const place = autocompleteInstance.getPlace();
        handlePlaceSelected(place);

        // Emit event to update the map
        if (place?.geometry && place?.geometry?.location) {
          EventBus.emit("placeChanged", {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      }
    } else {
      alert("Please enter text");
    }
  }

  const handleCategoryChange = (category) => {
    console.log("category", category);
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="search-component">
      <h2>Find a Branch</h2>{" "}
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input type="text" placeholder="Search..." className="search-input" />
      </Autocomplete>
      <div className="filters">
        <div className="categories">
          <h3>Categories</h3>
          {categories.map((category) => (
            <div key={category}>
              <input
                type="checkbox"
                id={category}
                value={category}
                onChange={() => handleCategoryChange(category)}
              />
              <label htmlFor={category}>{category}</label>
            </div>
          ))}
        </div>
        <div className="distance">
          <h3>Distance (miles)</h3>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Enter distance"
          />
        </div>
      </div>
      <button className="search-button" onClick={() => onPlaceChanged()}>
        Refine Results
      </button>
    </div>
  );
}
