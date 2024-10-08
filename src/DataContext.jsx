import React, { createContext, useContext, useState, useEffect } from "react";
import useFetchData from "./hooks/useFetchData"; // Adjust the path as necessary

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const dataApiUrl = import.meta.env.VITE_DATA_API_URL_2;
  const { data, branchCount, atmCount } = useFetchData(dataApiUrl);
  return (
    <DataContext.Provider value={{ data, branchCount, atmCount }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};
