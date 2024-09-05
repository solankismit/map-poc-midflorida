import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function useFetchData() {
  const query = useQuery();
  const [data, setData] = useState([]);
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
      .then((fetchedData) => setData(fetchedData ? fetchedData : []))
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

  return data;
}

export default useFetchData;
