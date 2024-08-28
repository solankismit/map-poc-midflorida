import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import EventBus from "../EventBus";

const mapContainerStyle = {
  height: "500px",
  width: "100%",
};

const center = {
  lat: 0,
  lng: 0,
};

function CustomMapComponent() {
  const [markers, setMarkers] = useState([]);
  const dataApiUrl = import.meta.env.VITE_DATA_API_URL_2;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fetchData = async () => {
    fetch(dataApiUrl)
      .then((response) => response.json())
      .then((data) => {
        const finalData = data[0]["data"];
        const newMarkers = finalData.map((item) => ({
          lat: parseFloat(item.location[0]),
          lng: parseFloat(item.location[1]),
        }));
        setMarkers(newMarkers);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };
  useEffect(() => {
    // Fetch data from DATA_API
    fetchData();
    EventBus.on("dataUpdated", fetchData);
  }, []);

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={2}>
      {markers.map((position, index) => (
        <Marker key={index} position={position} />
      ))}
    </GoogleMap>
  );
}

export default CustomMapComponent;
