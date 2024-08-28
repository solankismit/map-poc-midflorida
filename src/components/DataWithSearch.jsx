import React, { useEffect, useState } from "react";
import EventBus from "../EventBus";

function SearchComponent() {
  const updateData = async () => {
    try {
      const dataApiUrl1 = import.meta.env.VITE_DATA_API_URL;
      const dataApiUrl2 = import.meta.env.VITE_DATA_API_URL_2;
      const response1 = await fetch(dataApiUrl1, { method: "GET" });
      const data1 = await response1.json();

      if (data1) {
        console.log("Data fetched successfully:", data1);
        const response2 = await fetch(dataApiUrl2 + "/data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: [] }),
        });
        const data2 = await response2.json();
        setData(data2);
      }
    } catch (error) {
      console.error("Error fetching or updating data:", error);
    }
    EventBus.emit("dataUpdated");
  };

  const handlePlaceSelected = (place) => {
    console.log("Place selected:", place);
    // You can use the selected place information here if needed
  };
  return (
    <div className="search-component">
      <h2>Find a Branch</h2>
      <input type="text" placeholder="Search..." className="search-input" />
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
