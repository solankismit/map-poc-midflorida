import React, { useEffect, useRef, useState } from "react";
import EventBus from "../../EventBus";
import ReactGoogleAutocomplete from "react-google-autocomplete";
import { calculateDistance } from "../../utils";
import SearchComponent from "./partial/SearchComponent";
import DataComponent from "./partial/DataComponent";

const DataWithSearch = () => {
  return (
    <div className="data-with-search">
      <SearchComponent />
      <DataComponent />
    </div>
  );
};

export default DataWithSearch;
