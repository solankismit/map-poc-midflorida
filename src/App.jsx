import React from "react";
import "./App.css"; // Import your CSS file
import FindABranchTitle from "./components/Title";
import CustomMapComponent from "./components/CustomMapComponent";
import DataWithSearch from "./components/DataWithSearch";

function App() {
  return (
    <div className="App">
      <FindABranchTitle />

      <div className="content-wrapper">
        <div className="filter-sidebar">
          <DataWithSearch />
        </div>

        <div className="map">
          <CustomMapComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
