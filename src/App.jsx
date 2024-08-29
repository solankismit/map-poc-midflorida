import React from "react";
import "./App.css"; // Import your CSS file
import FindABranchTitle from "./components/Title";
import CustomMapComponent from "./components/CustomMapComponent";
import DataWithSearch from "./components/DataWithSearch/DataWithSearch";
import { LoadScript } from "@react-google-maps/api";

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const libraries = ["places"];
  return (
    <div className="App">
      <FindABranchTitle />

      <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
        <div className="content-wrapper">
          <div className="filter-sidebar">
            <DataWithSearch />
          </div>

          <div className="map">
            <CustomMapComponent />
          </div>
        </div>
      </LoadScript>
    </div>
  );
}

export default App;
