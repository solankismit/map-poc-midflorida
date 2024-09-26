import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF } from "@react-google-maps/api";
import EventBus from "../EventBus";
import { useData } from "../DataContext";

function CustomMapComponent({ initialCenter, onMapLoad, mapContainerStyle }) {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(initialCenter ?? { lat: 0, lng: 0 });
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [selectedMarkerDetails, setSelectedMarkerDetails] = useState(null);
  const [googleMaps, setGoogleMaps] = useState(null);
  const markersRef = useRef([]);
  const mapRef = useRef(null);

  const { data } = useData();
  // Extract markers from data
  useEffect(() => {
    const newMarkers = data.map((item) => ({
      id: item.id,
      location: {
        lat: parseFloat(item.latitude), // Use 'latitude' and 'longitude' from data
        lng: parseFloat(item.longitude),
      },
      details: {
        title: item.locationName, // Use 'locationName' for title
        address: item.address,
        categories: item?.locationTypeList, // Use 'locationTypeList' for categories
        url: item?.url,
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
        mapRef.current.setZoom(14); // Adjust zoom level as needed
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

  const createIcon = (size) => {
    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="19.5" r="7.5" fill="white"/>
      <path d="M24 24C25.1 24 26.0417 23.6083 26.825 22.825C27.6083 22.0417 28 21.1 28 20C28 18.9 27.6083 17.9583 26.825 17.175C26.0417 16.3917 25.1 16 24 16C22.9 16 21.9583 16.3917 21.175 17.175C20.3917 17.9583 20 18.9 20 20C20 21.1 20.3917 22.0417 21.175 22.825C21.9583 23.6083 22.9 24 24 24ZM24 44C18.6333 39.4333 14.625 35.1917 11.975 31.275C9.325 27.3583 8 23.7333 8 20.4C8 15.4 9.60833 11.4167 12.825 8.45C16.0417 5.48333 19.7667 4 24 4C28.2333 4 31.9583 5.48333 35.175 8.45C38.3917 11.4167 40 15.4 40 20.4C40 23.7333 38.675 27.3583 36.025 31.275C33.375 35.1917 29.3667 39.4333 24 44Z" fill="url(#paint0_linear_5541_32201)"/>
      <defs>
        <linearGradient id="paint0_linear_5541_32201" x1="40" y1="4.00001" x2="3.98764" y2="8.01546" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00B49C"/>
          <stop offset="0.66" stop-color="#008674"/>
        </linearGradient>
      </defs>
    </svg>`;

    const base64Icon = `data:image/svg+xml;base64,${btoa(svgIcon)}`;

    return {
      url: base64Icon,
      scaledSize: new google.maps.Size(size, size), // Set the size here
    };
  };

  // Map styles remain unchanged
  const greyMapStyles = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#f5f5f5",
        },
      ],
    },
    {
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#616161",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#f5f5f5",
        },
      ],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#bdbdbd",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#eeeeee",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [
        {
          color: "#e5e5e5",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#757575",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#dadada",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#616161",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [
        {
          color: "#e5e5e5",
        },
      ],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [
        {
          color: "#eeeeee",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#c9c9c9",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
  ];

  let markerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
  <mask id="mask0_5541_32201" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
    <rect width="48" height="48" fill="#D9D9D9"/>
  </mask>
  <g mask="url(#mask0_5541_32201)">
    <circle cx="24" cy="19.5" r="7.5" fill="white"/>
    <path d="M24 24C25.1 24 26.0417 23.6083 26.825 22.825C27.6083 22.0417 28 21.1 28 20C28 18.9 27.6083 17.9583 26.825 17.175C26.0417 16.3917 25.1 16 24 16C22.9 16 21.9583 16.3917 21.175 17.175C20.3917 17.9583 20 18.9 20 20C20 21.1 20.3917 22.0417 21.175 22.825C21.9583 23.6083 22.9 24 24 24ZM24 44C18.6333 39.4333 14.625 35.1917 11.975 31.275C9.325 27.3583 8 23.7333 8 20.4C8 15.4 9.60833 11.4167 12.825 8.45C16.0417 5.48333 19.7667 4 24 4C28.2333 4 31.9583 5.48333 35.175 8.45C38.3917 11.4167 40 15.4 40 20.4C40 23.7333 38.675 27.3583 36.025 31.275C33.375 35.1917 29.3667 39.4333 24 44Z" fill="url(#paint0_linear_5541_32201)"/>
  </g>
  <defs>
    <linearGradient id="paint0_linear_5541_32201" x1="40" y1="4.00001" x2="3.98764" y2="8.01546" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00B49C"/>
      <stop offset="0.66" stop-color="#008674"/>
    </linearGradient>
  </defs>
</svg>`;

  const defaultIcon = createIcon(30);
  const selectedIcon = createIcon(40);

  return (
    <div className="map">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenter}
        zoom={center?.lat == center?.lng && center?.lng === 0 ? 3 : 7}
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
          animation: true,
          fullscreenControl: true,
          mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [
              "roadmap",
              "satellite",
              "hybrid",
              "terrain",
              "styled_map",
            ],
          },
          streetViewControl: false,
          zoomControl: true,
          capabilities: {
            input: true,
            autocomplete: true,
            directions: true,
            distanceMatrix: true,
            details: true,
            actions: false,
          },
          styles: greyMapStyles,
        }}
      >
        {markers.map((position, index) => (
          <React.Fragment key={position.id}>
            <MarkerF
              key={position.id}
              icon={defaultIcon} // Use the same icon for both selected and unselected markers
              position={position.location}
              onClick={() => handleMarkerClick(position.id)}
            >
              {position.id === selectedMarkerId && selectedMarkerDetails ? (
                <InfoWindowF position={position.location}>
                  <div
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      maxWidth: "200px",
                      height: "auto",
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
                      {selectedMarkerDetails?.categories?.join(", ")}
                    </p>

                    <a
                      href={selectedMarkerDetails?.url}
                      style={{
                        backgroundColor: "#4CAF50", // Green background
                        color: "white", // White text
                        border: "none", // No border
                        borderRadius: "5px", // Rounded corners
                        padding: "10px 15px", // Padding
                        cursor: "pointer", // Pointer cursor on hover
                        fontSize: "14px", // Font size
                        marginTop: "10px", // Margin on top
                        textAlign: "center", // Center text
                        display: "inline-block", // Make it behave like a button
                      }}
                      onClick={() => {
                        // Add your anchor click logic here
                        console.log("Anchor clicked!");
                      }}
                    >
                      View Details
                    </a>
                  </div>
                </InfoWindowF>
              ) : null}
            </MarkerF>
          </React.Fragment>
        ))}
      </GoogleMap>
    </div>
  );
}

export default CustomMapComponent;
