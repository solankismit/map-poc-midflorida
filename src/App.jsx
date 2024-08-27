import React from 'react';
import './App.css'; // Import your CSS file
import SearchBar from './components/SearchBar';
import CategoryTag from './components/CategoryTag';
import FilterSidebar from './components/FilterSidebar';
import DataList from './components/DataList';
import Pagination from './components/Pagination';

function App() {

  return (
    <div className="App">
      <SearchBar /> 

      <CategoryTag  />

      <div className="content-wrapper"> 
        <div className="filter-sidebar">
          <FilterSidebar />
        </div>

        <div className="data-list">
          <DataList />
          <Pagination/>
        </div>
      </div>
    </div>
  );
}

export default App;
