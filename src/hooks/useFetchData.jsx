import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

function useFetchData() {
  const query = useQuery();
  const [data, setData] = useState([]);

  useEffect(() => {
    let queryStr = "";
    query.forEach((value, key) => {
      queryStr += `${key}=${value}&`;
    });

    queryStr = queryStr.slice(0, -1);
    const dataApiUrl = `${import.meta.env.VITE_DATA_API_URL}?${queryStr}`;

    fetch(dataApiUrl)
      .then((response) => response.json())
      .then((data) => (data ? setData(data) : setData([])))
      .catch((error) => console.error("Error fetching data:", error));
  }, [query.toString()]);

  return data;
}

export default useFetchData;
