import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, OverlayView } from "@react-google-maps/api";
import EventBus from "../EventBus";
import { useData } from "../DataContext";

const mapContainerStyle = {
  height: "500px",
  width: "100%",
};

function CustomMapComponent({ initialCenter, onMapLoad }) {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(initialCenter ?? { lat: 0, lng: 0 });
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [selectedMarkerDetails, setSelectedMarkerDetails] = useState(null);
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
      details: {
        title: item.title,
        address: item.address,
        categories: item.categories,
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
      setSelectedMarkerDetails(marker.details); // Set the details of the selected marker
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
      setSelectedMarkerDetails(null); // Clear selected marker details
      EventBus.emit("markerClicked", null);
    });
    console.log("Initial center: ", initialCenter);
    console.log(
      "Center: ",
      center?.lat == center?.lng,
      center?.lat === 0,
      center?.lat,
      center?.lng
    );
    return () => {
      EventBus.off("placeChanged", handleDataUpdate);
      EventBus.off("listItemClicked", handleListItemClick);
      EventBus.off("resetMap", () => {
        setSelectedMarkerId(null);
        setSelectedMarkerDetails(null); // Clear selected marker details
      });
    };
  }, []);

  useEffect(() => {
    if (initialCenter) {
      setCenter(initialCenter);
    }
  }, [initialCenter]);

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
      center={initialCenter}
      zoom={center?.lat == center?.lng && center?.lng === 0 ? 2 : 5}
      onLoad={(map) => {
        mapRef.current = map;
        setGoogleMaps(window.google.maps);
        if (onMapLoad) {
          onMapLoad();
        }
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
        <>
          <Marker
            key={index}
            icon={
              position?.id === selectedMarkerId ? selectedIcon : defaultIcon
            }
            position={position.location}
            onClick={() => handleMarkerClick(position.id)}
          >
            {position.id === selectedMarkerId && selectedMarkerDetails && (
              <OverlayView
                position={position.location}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={(width, height) => ({
                  x: -(width / 2),
                  y: -height,
                })}
              >
                <div
                  style={{
                    background: "white",
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    maxWidth: "200px",
                    width: "fit-content",
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 5px",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    {selectedMarkerDetails.title}
                  </h4>
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "14px",
                      color: "#666",
                      textWrap: "nowrap",
                    }}
                  >
                    {selectedMarkerDetails.address}
                  </p>
                  <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                    {selectedMarkerDetails.categories.join(", ")}
                  </p>
                </div>
              </OverlayView>
            )}
          </Marker>
        </>
      ))}
    </GoogleMap>
  );
}

export default CustomMapComponent;
