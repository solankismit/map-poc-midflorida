import React, { useEffect, useRef, useState } from "react";
import EventBus from "../EventBus";
import ReactGoogleAutocomplete from "react-google-autocomplete";
import { calculateDistance } from "../utils";

function SearchComponent() {
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
          console.log("Distances:", distances);
        }
        console.log("Data fetched successfully:", data1);
        const response2 = await fetch(dataApiUrl2 + "/data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: data1 }),
        });
        const data2 = await response2.json();
      }
    } catch (error) {
      console.error("Error fetching or updating data:", error);
    }
    EventBus.emit("dataUpdated");
  };

  const handlePlaceSelected = (place) => {
    console.log("Place selected:", place);
    //   Get Lat,lng from place object and set data that is 50 miles from that lat,lng
    //   Call updateData function
    updateData(place, 50);
    // You can use the selected place information here if needed
  };
  return (
    <div className="search-component">
      <h2>Find a Branch</h2>{" "}
      <ReactGoogleAutocomplete
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onPlaceSelected={handlePlaceSelected}
        types={["(regions)"]}
        className="search-input"
        placeholder="Search..."
      />
      <button className="search-button" onClick={updateData}>
        Refine Results
      </button>
    </div>
  );
}

function DataComponent() {
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

const DataWithSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to handle search button click
  const handleSearchClick = () => {
    // Perform search logic here
    // Update the 'data' state with the search results
  };

  return (
    <div className="data-with-search">
      <SearchComponent />
      <DataComponent />
    </div>
  );
};

export default DataWithSearch;
