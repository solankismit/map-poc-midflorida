import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import EventBus from "../EventBus";
import { useData } from "../DataContext";

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

  const data = useData();
  // Extract markers from data
  useEffect(() => {
    const newMarkers = data.map((item) => ({
      id: item.id,
      location: {
        lat: parseFloat(item.location[0]),
        lng: parseFloat(item.location[1]),
      },
    }));
    setMarkers(newMarkers);
  }, [data]);

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
    mapRef.current.panTo(center);
    google.maps.event.addListenerOnce(mapRef.current, "idle", () => {
      mapRef.current.setZoom(5);
    });
  };

  // Handle data fetching and marker click events
  useEffect(() => {
    EventBus.on("placeChanged", handleDataUpdate);
    EventBus.on("listItemClicked", handleListItemClick);
    EventBus.on("resetMap", () => {
      setSelectedMarkerId(null);
      EventBus.emit("markerClicked", null);
    });
    return () => {
      EventBus.off("placeChanged", handleDataUpdate);
      EventBus.off("listItemClicked", handleListItemClick);
      EventBus.off("resetMap", () => {
        setSelectedMarkerId(null);
      });
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
