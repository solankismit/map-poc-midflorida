import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

function useFetchData() {
  const query = useQuery();
  const [data, setData] = useState([]);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [abortController, setAbortController] = useState(null);

  useEffect(() => {
    // Fetch data with no query parameters initially
    const controller = new AbortController();
    setAbortController(controller);
    const dataApiUrl = `${import.meta.env.VITE_DATA_API_URL}`;
    console.log("Fetching initial data...");

    fetch(dataApiUrl, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        setData(data ? data : []);
        setInitialFetchDone(true);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Initial fetch aborted");
        } else {
          console.error("Error fetching initial data:", error);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (initialFetchDone) {
      // Abort the previous fetch request if a new one is initiated
      if (abortController) {
        abortController.abort();
      }

      const controller = new AbortController();
      setAbortController(controller);

      // Fetch data with query parameters if they exist
      // console.log("Fetching data with query parameters...", query.toString());
      let queryStr = "";
      query.forEach((value, key) => {
        queryStr += `${key}=${value}&`;
      });

      queryStr = queryStr.slice(0, -1);
      const dataApiUrl = `${import.meta.env.VITE_DATA_API_URL}?${queryStr}`;

      fetch(dataApiUrl, { signal: controller.signal })
        .then((response) => response.json())
        .then((data) => setData(data ? data : []))
        .catch((error) => {
          if (error.name === "AbortError") {
            console.log("Fetch with query parameters aborted");
          } else {
            console.error("Error fetching data:", error);
          }
        });

      return () => controller.abort();
    }
  }, [query.toString(), initialFetchDone]);

  useEffect(() => {
    console.log("Data fetched:", data ? data.length : 0);
  }, [data]);

  return data;
}

export default useFetchData;
