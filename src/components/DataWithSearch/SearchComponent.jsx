import React, { useEffect, useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import EventBus from "../../EventBus";
import { useNavigate } from "react-router-dom";

const categories = ["ATM", "Bank", "Credit Union"];

export default function SearchComponent() {
  const [filtersBar, setFiltersBar] = useState(false);
  const [view, setView] = useState(""); // 'list' or 'map'

  const toggleView = (selectedView) => {
    if (selectedView === view) {
      setView("");
      EventBus.emit("viewChanged", "");
      return;
    }
    setView(selectedView);
    EventBus.emit("viewChanged", selectedView);
  };

  // const [autocompleteInstance, setAutocompleteInstance] = useState("");

  const autocompleteInstance = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [distance, setDistance] = useState("50");
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  const [predictions, setPredictions] = useState([]);
  useEffect(() => {
    EventBus.on("viewChanged", (view) => {
      setView(view);
    });
    const urlParams = new URLSearchParams(window.location.search);
    const placeQuery = urlParams.get("place");
    if (placeQuery) {
      setInputValue(
        placeQuery.toString().charAt(0).toUpperCase() +
          placeQuery.toString().slice(1)
      );
    }

    return () => {
      EventBus.off("viewChanged");
    };
  }, []);
  const handlePlaceSelected = (from, place) => {
    console.log("handleplaceSelected from ", from, " :: ", place);
    setInputValue(place?.description || place?.formatted_address || "");
    // Insert it in URL Query
    const url = new URL(window.location.href);
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      // url.searchParams.set("place", place.formatted_address);
      url.searchParams.set("lat", lat);
      url.searchParams.set("lng", lon);
      url.searchParams.set(
        "place",
        place?.formatted_address || place?.name || place?.description || ""
      );
      EventBus.emit("placeChanged", {
        lat: lat,
        lng: lon,
      });
    } else {
      url.searchParams.delete("lat");
      url.searchParams.delete("lng");
      url.searchParams.delete("place");
      EventBus.emit("resetMap");
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

    if (autocompleteInstance.current) {
      const innerplace = autocompleteInstance.current.getPlace();

      if (
        inputValue != "" &&
        innerplace &&
        Object.keys(innerplace).length > 1
      ) {
        setPlace(innerplace);
        handlePlaceSelected(" innerplace onPlacedChanged", innerplace);
        setPredictions([]);
      } else {
        handlePlaceSelected(" else onPlacedChanged", place);
      }
    }
  }
  const clearInput = () => {
    setInputValue("");
    handlePlaceSelected("clearInput", null);
  };
  const handleInputChange = (e) => {
    console.log("handleInputChange :: ", e.target.value);
    console.log("SETTING NULL");
    setPlace(null);
    // if (e.target.value === "") {
    setPredictions([]);
    // }
    const value = e.target.value;
    setInputValue(value);
    // Fetch predictions based on user input
    if (autocompleteInstance.current) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: value, componentRestrictions: { country: "us" } },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            console.log("Predictions:", results);
            setPredictions(results);
          } else {
            setPredictions([]);
          }
        }
      );
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
            handlePlaceSelected("handle proceed", details); // Call to handlePlaceSelected with full details
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

  const IconComponent = ({ icon, color = "#fff", size = "24" }) => {
    switch (icon) {
      case "filter":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 25 24"
            fill="none"
          >
            <mask
              id="mask0_2649_37270"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={size}
              height={size}
            >
              <rect x="0.5" width={size} height={size} fill={color} />
            </mask>
            <g mask="url(#mask0_2649_37270)">
              <path
                d="M10.5 18V16H14.5V18H10.5ZM6.5 13V11H18.5V13H6.5ZM3.5 8V6H21.5V8H3.5Z"
                fill="#042968"
              />
            </g>
          </svg>
        );

      case "list":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
              stroke={color}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        );

      case "map":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
              stroke={color}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        );
      default:
        break;
    }
  };

  return (
    <>
      <div className="search-component">
        <h6>Find a Branch or ATM</h6>{" "}
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{ componentRestrictions: { country: "us" } }}
        >
          <div className="input-wrapper">
            <input
              id="autocomplete-instance"
              type="text"
              placeholder="Enter Zip Code or Address,City,State"
              className="search-input"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {inputValue && (
              <button className="clear-button" onClick={clearInput}>
                &times;
              </button>
            )}
          </div>
        </Autocomplete>
        <div className="search-buttons">
          <div className="toggle-buttons">
            <button
              className={`toggle-button ${view === "list" ? "active" : ""}`}
              onClick={() => toggleView("list")}
            >
              <IconComponent
                icon={"list"}
                color={`${view == "list" ? "white" : "#042968"}`}
              />
            </button>
            <button
              className={`toggle-button ${view === "map" ? "active" : ""}`}
              onClick={() => toggleView("map")}
            >
              <IconComponent
                icon={"map"}
                color={`${view == "map" ? "white" : "#042968"}`}
              />
            </button>
          </div>
          <button
            className="search-button l-body"
            onClick={() => setFiltersBar(!filtersBar)}
          >
            <IconComponent icon={"filter"} />
            Refine Results
          </button>
        </div>
        {filtersBar && (
          <div className="filters">
            <div className="filters-select">
              <div className="categories">
                <h3 className="m-body">Categories</h3>
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
                <h3 className="m-body">Distance (miles)</h3>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter distance"
                />
              </div>
            </div>
            <button
              className="apply-filters-btn"
              onClick={() => handlePlaceSelected(place)}
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>
      <p className="m-body data-numbers">
        Showing <span className="data-numbers-unq">XX</span> Branches and{" "}
        <span className="data-numbers-unq">XX</span> ATMs
      </p>
    </>
  );
}
