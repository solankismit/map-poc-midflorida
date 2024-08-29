import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const markersRef = useRef([]);
  const mapRef = useRef(null);
  const dataApiUrl = import.meta.env.VITE_DATA_API_URL_2;

  const fetchData = async () => {
    fetch(dataApiUrl)
      .then((response) => response.json())
      .then((data) => {
        const finalData = data[0]["data"];
        const newMarkers = finalData.map((item) => ({
          id: item.id,
          location: {
            lat: parseFloat(item.location[0]),
            lng: parseFloat(item.location[1]),
          },
        }));
        setMarkers(newMarkers);
      })
      .catch((error) => console.error("Error fetching data:", error));
    };
    
  const handleMarkerClick = (id) => {
    handleListItemClick(id);
    EventBus.emit("markerClicked", id);
  };

  const handleListItemClick = (id) => {
    const marker = markersRef.current.find((marker) => marker.id === id);
    if (marker && mapRef.current) {
      mapRef.current.panTo({
        lat: marker.location.lat,
        lng: marker.location.lng,
      });
      google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
        mapRef.current.setZoom(10); // Adjust zoom level as needed
      });
    }
  };
    // Handle data fetching and marker click events
  useEffect(() => {
    // Fetch data from DATA_API
    fetchData();
    EventBus.on("dataUpdated", fetchData);

    EventBus.on("listItemClicked", handleListItemClick);

    return () => {
      EventBus.off("dataUpdated", fetchData);
      EventBus.off("listItemClicked", handleListItemClick);
    };
  }, []);

    
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);


  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={2}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        gestureHandling: "greedy", // Optional: Improve user interaction
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        mapTypeControlOptions: {
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
        animation: true,
      }}
    >
      {markers.map((position, index) => (
        <Marker
          key={index}
          position={position.location}
          onClick={() => handleMarkerClick(position.id)}
        />
      ))}
    </GoogleMap>
  );
}

export default CustomMapComponent;
