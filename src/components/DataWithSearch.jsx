import React, { useEffect, useState } from "react";
import EventBus from "../EventBus";
import ReactGoogleAutocomplete from "react-google-autocomplete";

function SearchComponent() {
  const updateData = async (selectedPlace, distance) => {
    try {
      const dataApiUrl1 = import.meta.env.VITE_DATA_API_URL;
      const dataApiUrl2 = import.meta.env.VITE_DATA_API_URL_2;
      const response1 = await fetch(dataApiUrl1, { method: "GET" });
      let data1 = await response1.json();

      if (data1) {
        console.log("INIT Data fetched successfully:", data1);
        //   If distance is in int
        if (typeof distance === "number") {
          let distances = [];
          console.log("Filtering data based on distance:", distance);
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
        // setData(data2);
      }
    } catch (error) {
      console.error("Error fetching or updating data:", error);
    }
    EventBus.emit("dataUpdated");
  };

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    console.log("Calculating distance between:", lat1, lon1, lat2, lon2);
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    const distanceInMiles = Math.floor(distance / 1.609);
    return distanceInMiles;
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

  const dataApiUrl2 = import.meta.env.VITE_DATA_API_URL_2;

  function fetchData() {
    console.log("fetching data...");
    fetch(dataApiUrl2) // Replace with your actual API URL
      .then((response) => response.json())
      .then((data) => (data ? setData(data[0]["data"]) : setData([])))
      .catch((error) => console.error("Error fetching data:", error));
  }
  useEffect(() => {
    fetchData();
    EventBus.on("dataUpdated", fetchData);

    return () => {
      EventBus.off("dataUpdated", fetchData);
    };
  }, []);

  return (
    <div className="data-component">
      {data.map((item) => (
        <div key={item.id} className="data-item">
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
