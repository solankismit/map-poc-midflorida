import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateDistance } from "../utils";

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
  const fetchData = (url, controller) => {
    return fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((fetchedData) => {
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
        const updatedData = fetchedData
          ? fetchedData.map((item) => ({
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
          updatedData.filter((item) =>
            item?.locationTypeList?.includes("Branch")
          ).length
        );
        setAtmCount(
          updatedData.filter((item) => item?.locationTypeList?.includes("ATM"))
            .length
        );

        // Sort data by distance
        const sortedData = updatedData.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        );

        setData(sortedData);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching data:", error);
        }
      });
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
