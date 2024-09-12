import React, { useEffect, useState } from "react";
import "./App.css"; // Import your CSS file
import FindABranchTitle from "./components/Title";
import CustomMapComponent from "./components/CustomMapComponent";
import { LoadScript } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { geocodeAddress } from "./service/geocoding";
import DataComponent from "./components/DataWithSearch/DataComponent";
import SearchComponent from "./components/DataWithSearch/SearchComponent";
import EventBus from "./EventBus";

function App() {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const libraries = ["places"];
  const [coordinates, setCoordinates] = useState({
    lat: 0,
    lng: 0,
  });

  const [view, setView] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      EventBus.emit("viewChanged", "");
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    EventBus.on("viewChanged", (view) => {
      setView(view);
    });

    return () => {
      EventBus.off("viewChanged");
    };
  }, []);
  return (
    <div className="App branch-locator">
      <FindABranchTitle />

      <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
        <div className="content-wrapper ">
          <div className="filter-sidebar">
            <div className="data-with-search">
              <SearchComponent />
              {(view == "map" || view == "") && isMobile && (
                <CustomMapComponent
                  initialCenter={coordinates}
                  onMapLoad={() => {
                    fetchPlaceArgs();
                  }}
                  mapContainerStyle={{
                    height: "390px",
                    width: "100%",
                  }}
                />
              )}
              {(view == "list" || view == "") && <DataComponent />}
            </div>
          </div>

          {!isMobile && (
            <CustomMapComponent
              initialCenter={coordinates}
              onMapLoad={() => {
                fetchPlaceArgs();
              }}
              mapContainerStyle={{
                height: "914px",
                width: "100%",
              }}
            />
          )}
        </div>
      </LoadScript>
    </div>
  );
}

export default App;
