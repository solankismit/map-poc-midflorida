import React, { useEffect, useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import EventBus from "../../../EventBus";
import { useNavigate } from "react-router-dom";

const categories = ["ATM", "Bank", "Credit Union"];

export default function SearchComponent() {
  // const [autocompleteInstance, setAutocompleteInstance] = useState("");
  const autocompleteInstance = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [distance, setDistance] = useState("50");
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  const [predictions, setPredictions] = useState([]);

  const handlePlaceSelected = (place) => {
    console.log("handleplaceSelected :: ", place);
    setInputValue(place?.description || place?.formatted_address || "");
    // Insert it in URL Query
    const url = new URL(window.location.href);
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      // url.searchParams.set("place", place.formatted_address);
      url.searchParams.set("lat", lat);
      url.searchParams.set("lon", lon);
      EventBus.emit("placeChanged", {
        lat: lat,
        lng: lon,
      });
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
    autocompleteInstance.current = autocomplete;
  }

  function onPlaceChanged() {
    console.log("onPlaceChanged :: ", autocompleteInstance.current);
    EventBus.emit("resetMap");

    if (autocompleteInstance != null) {
      if (autocompleteInstance !== "") {
        const innerplace = autocompleteInstance.current.getPlace();
        // Remove name key and check if the place is valid
        // Check if other keys are present
        if (innerplace && Object.keys(innerplace).length > 1) {
          setPlace(innerplace);
          handlePlaceSelected(innerplace);
        } else {
          handlePlaceSelected(place);
        }
      }
    } else {
      alert("Please enter text");
    }
  }

  const handleInputChange = (e) => {
    console.log("handleInputChange :: ", e.target.value);
    console.log("SETTING NULL");
    setPlace(null);
    const value = e.target.value;
    setInputValue(value);
    // Fetch predictions based on user input
    if (autocompleteInstance.current) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: value }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log("Predictions:", results);
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      });
    }
  };

  const handleProceed = () => {
    // Check if a place has been selected
    if (!place && predictions.length > 0) {
      const firstPlace = predictions[0];
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      service.getDetails(
        { placeId: firstPlace.place_id },
        (details, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setPlace(details); // Update place with full details
            handlePlaceSelected(details); // Call to handlePlaceSelected with full details
          } else {
            console.error("Error fetching place details:", status);
          }
        }
      );
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleProceed();
    }
  };

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
        <input
          id="autocomplete-instance"
          type="text"
          placeholder="Search..."
          className="search-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
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
