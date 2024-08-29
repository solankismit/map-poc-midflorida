import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import EventBus from "../EventBus";

const mapContainerStyle = {
  height: "500px",
  width: "100%",
};

function CustomMapComponent() {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [googleMaps, setGoogleMaps] = useState(null);
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
    setSelectedMarkerId(id);
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
  const handleDataUpdate = (center) => {
    fetchData();
    setCenter(center);
  };
  // Handle data fetching and marker click events
  useEffect(() => {
    // Fetch data from DATA_API
    fetchData();
    EventBus.on("dataUpdated", handleDataUpdate);

    EventBus.on("listItemClicked", handleListItemClick);

    return () => {
      EventBus.off("dataUpdated", handleDataUpdate);
      EventBus.off("listItemClicked", handleListItemClick);
    };
  }, []);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  const createIcon = (url, size) => {
    if (googleMaps) {
      return {
        url,
        scaledSize: new googleMaps.Size(size, size),
      };
    }
    return null;
  };

  const defaultIcon = createIcon("/marker.png", 30);
  const selectedIcon = createIcon("/selected-marker.png", 40);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={2}
      onLoad={(map) => {
        mapRef.current = map;
        setGoogleMaps(window.google.maps);
      }}
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
          icon={position?.id === selectedMarkerId ? selectedIcon : defaultIcon}
          position={position.location}
          onClick={() => handleMarkerClick(position.id)}
        />
      ))}
    </GoogleMap>
  );
}

export default CustomMapComponent;
