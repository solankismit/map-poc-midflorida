import React, { useEffect, useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import EventBus from "../../EventBus";
import { useNavigate } from "react-router-dom";
import { useData } from "../../DataContext";

const categories = JSON.parse(
  document.getElementById("location-data").textContent
).data.map((item) => ({ label: item.category, value: item.slug }));
const element = document.getElementById("branch-locator");

export default function SearchComponent() {
  const [filtersBar, setFiltersBar] = useState(false);
  const [view, setView] = useState(""); // 'list' or 'map'
  const [isMobileView, setIsMobileView] = useState();
  const { branchCount, atmCount } = useData();

  const attrData = {
    findBranchLabel:
      element?.getAttribute("data-findbranchlabel") || "Find Branch or ATM",
    refineResult:
      element?.getAttribute("data-refineresult") || "Refine Results",
    filterBy: element?.getAttribute("data-filterby") || "Filter By",
    cta1: element?.getAttribute("data-cta1") || "#",
    cta2: element?.getAttribute("data-cta2") || "#",
    cta1Text: element?.getAttribute("data-cta1text") || "Call to Action",
    cta2Text: element?.getAttribute("data-cta2text") || "Call to Action",
  };

  if (!element) {
    console.error("Element with id 'branch-locator' not found.");
  }

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
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  const [predictions, setPredictions] = useState([]);
  useEffect(() => {
    EventBus.on("viewChanged", (view) => {
      setView(view);
    });
    EventBus.on("isMobileView", (view) => {
      setIsMobileView(view);
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
      EventBus.off("isMobileView", (view) => {
        setIsMobileView(view);
      });
      EventBus.off("viewChanged");
    };
  }, []);

  useEffect(() => {
    !isMobileView
      ? handlePlaceSelected("category changed useEffect", place)
      : "";
  }, [selectedCategories]);
  /**
   * Handles the selection of a place from the autocomplete dropdown.
   * Updates the input value, URL query parameters, and emits events.
   *
   * @param {string} from - The source function name of the place selection (e.g., "innerplace onPlacedChanged").
   * @param {google.maps.places.PlaceResult} place - The selected place object.
   */
  const handlePlaceSelected = (from, place) => {
    console.log("handleplaceSelected from ", from, " :: ", place);
    setInputValue(place?.description || place?.formatted_address || "");
    // Update URL query parameters based on the selected place
    const url = new URL(window.location.href);
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      // Set latitude, longitude, and place name in URL query
      url.searchParams.set("lat", lat);
      url.searchParams.set("lng", lon);
      url.searchParams.set(
        "place",
        place?.formatted_address || place?.name || place?.description || ""
      );
      // Emit event to update the map with the selected place
      EventBus.emit("placeChanged", {
        lat: lat,
        lng: lon,
      });
    } else {
      // Clear latitude, longitude, and place name from URL query
      url.searchParams.delete("lat");
      url.searchParams.delete("lng");
      url.searchParams.delete("place");
      // Emit event to reset the map
      EventBus.emit("resetMap");
    }

    // Update URL query parameters based on selected categories
    if (selectedCategories.length > 0) {
      url.searchParams.set("categories", selectedCategories.join(","));
    } else {
      url.searchParams.delete("categories");
    }

    // // Update URL query parameters based on distance
    // if (place && place.geometry && place.geometry.location && distance > 0) {
    //   url.searchParams.set("distance", distance);
    // } else {
    //   url.searchParams.delete("distance");
    // }

    // Navigate to the updated URL
    navigate(url.pathname + url.search);
  };

  /**
   * Handles the loading of the autocomplete component.
   * Stores the autocomplete instance in a ref for later use.
   *
   * @param {google.maps.places.Autocomplete} autocomplete - The autocomplete instance.
   */
  function onLoad(autocomplete) {
    autocompleteInstance.current = autocomplete;
  }

  /**
   * Handles the place change event of the autocomplete component.
   * Retrieves the selected place and updates the state accordingly.
   */
  function onPlaceChanged() {
    console.log("onPlaceChanged :: ", autocompleteInstance.current);

    if (autocompleteInstance.current) {
      const innerplace = autocompleteInstance.current.getPlace();

      // Check if a valid place is selected
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

  /**
   * Clears the input field and resets the selected place.
   */
  const clearInput = () => {
    setInputValue("");
    handlePlaceSelected("clearInput", null);
  };

  /**
   * Handles input changes in the search field.
   * Updates the input value and fetches predictions from Google Places.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    console.log("handleInputChange :: ", e.target.value);
    console.log("SETTING NULL");
    setPlace(null);
    // Clear predictions if the input is empty
    setPredictions([]);
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

  /**
   * Handles the "Proceed" button click.
   * If a place has not been selected, it fetches details for the first prediction.
   */
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

  /**
   * Handles key down events in the search field.
   * Triggers the "Proceed" action when the Enter key is pressed.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The key down event.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleProceed();
    }
  };

  /**
   * Handles category selection changes.
   * Updates the selected categories state.
   *
   * @param {string} category - The selected category.
   */
  const handleCategoryChange = (category, place) => {
    // If the category is already selected, remove it from the array
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      // Otherwise, add the category to the array
      setSelectedCategories([category]);
    }
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
              strokeWidth="2"
              strokeLinecap="round"
              strokelinejoinlinejoin="round"
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case "search":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.7556 16L9.15556 10.4C8.71111 10.7556 8.2 11.037 7.62222 11.2444C7.04444 11.4519 6.42963 11.5556 5.77778 11.5556C4.16296 11.5556 2.7963 10.9963 1.67778 9.87778C0.559259 8.75926 0 7.39259 0 5.77778C0 4.16296 0.559259 2.7963 1.67778 1.67778C2.7963 0.559259 4.16296 0 5.77778 0C7.39259 0 8.75926 0.559259 9.87778 1.67778C10.9963 2.7963 11.5556 4.16296 11.5556 5.77778C11.5556 6.42963 11.4519 7.04444 11.2444 7.62222C11.037 8.2 10.7556 8.71111 10.4 9.15556L16 14.7556L14.7556 16ZM5.77778 9.77778C6.88889 9.77778 7.83333 9.38889 8.61111 8.61111C9.38889 7.83333 9.77778 6.88889 9.77778 5.77778C9.77778 4.66667 9.38889 3.72222 8.61111 2.94444C7.83333 2.16667 6.88889 1.77778 5.77778 1.77778C4.66667 1.77778 3.72222 2.16667 2.94444 2.94444C2.16667 3.72222 1.77778 4.66667 1.77778 5.77778C1.77778 6.88889 2.16667 7.83333 2.94444 8.61111C3.72222 9.38889 4.66667 9.77778 5.77778 9.77778Z"
              fill="#042968"
            />
          </svg>
        );

      case "link":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Icon/UI">
              <mask
                id="mask0_5541_32182"
                masktype="alpha"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="16"
                height="16"
              >
                <rect id="Bounding box" width="16" height="16" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_5541_32182)">
                <path
                  id="open_in_new"
                  d="M3.33333 14C2.96667 14 2.65278 13.8694 2.39167 13.6083C2.13056 13.3472 2 13.0333 2 12.6667V3.33333C2 2.96667 2.13056 2.65278 2.39167 2.39167C2.65278 2.13056 2.96667 2 3.33333 2H8V3.33333H3.33333V12.6667H12.6667V8H14V12.6667C14 13.0333 13.8694 13.3472 13.6083 13.6083C13.3472 13.8694 13.0333 14 12.6667 14H3.33333ZM6.46667 10.4667L5.53333 9.53333L11.7333 3.33333H9.33333V2H14V6.66667H12.6667V4.26667L6.46667 10.4667Z"
                  fill="#042968"
                />
              </g>
            </g>
          </svg>
        );

      default:
        break;
    }
  };

  return (
    <>
      <div className="search-component">
        <h6>{attrData.findBranchLabel}</h6>
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
            <span className="search-icon">
              <IconComponent icon={"search"} size="16" />
            </span>
            {inputValue && (
              <button className="clear-button" onClick={clearInput}>
                &times;
              </button>
            )}
          </div>
        </Autocomplete>
        <div className="search-buttons">
          <div className="search-buttons-inner">
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
              className={`search-button l-body ${filtersBar ? "active" : " "}`}
              onClick={() => setFiltersBar(!filtersBar)}
            >
              <IconComponent icon={"filter"} />
              {attrData?.refineResult}
            </button>
          </div>
          {
            <div className={`filters ${filtersBar ? "active" : ""}`}>
              {isMobileView ? (
                <div
                  className="close-icon"
                  onClick={() => setFiltersBar(false)}
                >
                  &times;
                </div>
              ) : (
                <></>
              )}
              <div className="filters-select">
                <div className="categories">
                  <h3 className="m-body">{attrData?.filterBy}</h3>
                  <div className="categories-items">
                    {categories.map((category) => (
                      <div key={category?.value} className="category-item">
                        <input
                          type="checkbox"
                          id={category?.value}
                          name="category"
                          value={category?.value}
                          checked={selectedCategories.includes(category?.value)}
                          onChange={() =>
                            handleCategoryChange(category?.value, place)
                          }
                        />
                        <label htmlFor={category?.value} className="s-body">
                          {category?.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* <div className="distance">
                <h3 className="m-body">Distance (miles)</h3>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter distance"
                />
              </div> */}
              </div>
              {isMobileView ? (
                <button
                  className="apply-button"
                  onClick={() => handlePlaceSelected("apply btn", place)}
                >
                  Apply
                </button>
              ) : (
                <></>
              )}
            </div>
          }
          <div className="cta-links">
            <a href={attrData?.cta1} className="cta-link m-body">
              <span className="cta-link-text ">{attrData?.cta1Text}</span>
              <IconComponent icon={"link"} />
            </a>
            <a href={attrData?.cta2} className="cta-link m-body">
              <span className="cta-link-text">{attrData?.cta2Text}</span>
              <IconComponent icon={"link"} />
            </a>
          </div>
        </div>
      </div>
      <p className="m-body data-numbers">
        Showing <span className="data-numbers-unq">{branchCount}</span> Branches
        and <span className="data-numbers-unq">{atmCount}</span> ATMs
      </p>
    </>
  );
}
