import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateDistance } from "../utils";
import axios from "axios";

// Get the current hostname dynamically
const currentHostname = window.location.hostname;
let baseUrl = "";
let searchendpoint = "";
let itemid = "";

// Define the base URL for local development
const localhostBaseURL = "https://midweb-cm-00.midflorida.com";

// Check if the current hostname is localhost
if (currentHostname === "localhost") {
  baseUrl = localhostBaseURL;
} else {
  baseUrl = `https://${currentHostname}`;
}

// Get the main div element
const mainDiv = document.getElementById("branch-locator");

// Read data attributes
if (mainDiv) {
  searchendpoint = mainDiv.dataset.apiendpoint;
  itemid = mainDiv.dataset.itemid;
}

let payload = {
  searchWithinItemID: itemid,
  latitude: "",
  longitude: "",
  withinRadius: 10,
  locationTypeList: [],
  locationFeatureList: [],
  pageNumber: 1,
  pageSize: 10,
};
function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function useFetchData() {
  const query = useQuery();
  const [data, setData] = useState([]);
  const [atmCount, setAtmCount] = useState(0);
  const [branchCount, setBranchCount] = useState(0);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // Helper function to fetch data
  const fetchData = async (url, controller) => {
    console.log("base URL : ", baseUrl, searchendpoint, payload);
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      let result;

      if (window.location.hostname === "localhost") {
        // Fetch from local file during testing on localhost
        result = await axios.get("/data/data.json");
      } else {
        // Fetch from actual endpoint in production
        console.log("payload", payload);
        result = await axios.post(baseUrl + searchendpoint, payload, {
          headers,
        });
      }

      const userLocation = JSON.parse(localStorage.getItem("userLocation"));
      const { lat: userLat, lng: userLng } = userLocation || {
        lat: null,
        lng: null,
      };

      // Determine the location to use for distance calculation
      let locationToUse = null;
      if (query.get("lat") && query.get("lng")) {
        locationToUse = {
          lat: parseFloat(query.get("lat")),
          lng: parseFloat(query.get("lng")),
        };
      } else if (userLat && userLng) {
        locationToUse = {
          lat: parseFloat(userLat),
          lng: parseFloat(userLng),
        };
      }

      // Calculate distance and update data
      const updatedData = result.data.Results
        ? result.data.Results.map((item) => ({
            ...item,
            distance: locationToUse
              ? calculateDistance(
                  locationToUse.lat,
                  locationToUse.lng,
                  item.latitude,
                  item.longitude
                )
              : null,
          }))
        : [];

      setBranchCount(
        updatedData.filter((item) => item?.locationTypeList?.includes("Branch"))
          .length
      );
      setAtmCount(
        updatedData.filter((item) => item?.locationTypeList?.includes("ATM"))
          .length
      );

      setData(updatedData);
      console.log("Fetched data", result.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // Memoize the query string to avoid unnecessary recomputations
  const queryStr = useMemo(() => query.toString(), [query]);

  useEffect(() => {
    // Initial fetch without query parameters
    const controller = new AbortController();
    setAbortController(controller);

    const dataApiUrl = `${import.meta.env.VITE_DATA_API_URL}`;
    fetchData(dataApiUrl, controller).then(() => setInitialFetchDone(true));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (initialFetchDone) {
      // Abort the previous fetch if a new one is initiated
      if (abortController) {
        abortController.abort();
      }

      const controller = new AbortController();
      setAbortController(controller);

      // If there are query parameters, fetch data with them
      const dataApiUrl = `${import.meta.env.VITE_DATA_API_URL}${
        queryStr ? `?${queryStr}` : ""
      }`;
      fetchData(dataApiUrl, controller);

      return () => controller.abort();
    }
  }, [queryStr, initialFetchDone]);

  return { data, branchCount, atmCount };
}

export default useFetchData;
