import React, { useEffect, useState } from "react";
import "./App.css"; // Import your CSS file
import FindABranchTitle from "./components/Title";
import CustomMapComponent from "./components/CustomMapComponent";
import DataWithSearch from "./components/DataWithSearch/DataWithSearch";
import { LoadScript } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { geocodeAddress } from "./service/geocoding";

function App() {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const libraries = ["places"];
  const [coordinates, setCoordinates] = useState({
    lat: 0,
    lng: 0,
  }); // Default to San Francisco, USA

  useEffect(() => {
    const saveUserLocation = () => {
      if (!localStorage.getItem("userLocation")) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userLocation = { lat: latitude, lng: longitude };
            localStorage.setItem("userLocation", JSON.stringify(userLocation));
          },
          (error) => {
            console.error("Error getting user location:", error);
          }
        );
      }
    };

    saveUserLocation();
  }, []);

  const fetchPlaceArgs = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const place = urlParams.get("place");
    const distance = urlParams.get("distance") || 50;
    if (place) {
      try {
        const coords = await geocodeAddress(place);
        urlParams.set("lat", coords.lat);
        urlParams.set("lng", coords.lng);
        urlParams.set("distance", distance);
        setCoordinates(coords);
      } catch (error) {
        console.error("Error fetching place coordinates:", error);
        urlParams.set("lat", 0);
        urlParams.set("lng", 0);
        // Fallback to default US location if geocoding fails
        setCoordinates({ lat: 0, lng: 0 }); // San Francisco, USA
      } finally {
        navigate(`${window.location.pathname}?${urlParams.toString()}`);
      }
    }
  };
  return (
    <div className="App">
      <FindABranchTitle />

      <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
        <div className="content-wrapper">
          <div className="filter-sidebar">
            <DataWithSearch />
          </div>

          <div className="map">
            <CustomMapComponent
              initialCenter={coordinates}
              onMapLoad={() => {
                fetchPlaceArgs();
              }}
            />
          </div>
        </div>
      </LoadScript>
    </div>
  );
}

export default App;
