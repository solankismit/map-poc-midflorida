import React, { useState, useEffect } from 'react';
import EventBus from '../EventBus';

function FilterSidebar() {
  const [availableFilters, setAvailableFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('https://poc-midflorida.onrender.com/filters');
        if (!response.ok) {
          throw new Error('Network error fetching filters!');
        }
        const data = await response.json();
        setAvailableFilters(data.filters); 

      } catch (err) {
        console.error("Error fetching filters:", err);
        // Handle error (e.g., display an error message)
      }
    };

    fetchFilters();
  }, []);

  const handleFilterChange = (filterValue) => {
    setSelectedFilters(prevFilters => {
      if (prevFilters.includes(filterValue)) {
        return prevFilters.filter(val => val !== filterValue); 
      } else {
        // Add filter value if it's not selected
        return [...prevFilters, filterValue];
      }
    });
  };
  

  const applyFilters = () => {
    EventBus.emit('filtersUpdated', selectedFilters);
  };

  return (
    <div className='FilterSidebar'>
    <h3>Filters:</h3> 
    {availableFilters.map(filter => (
      <label key={filter}>
        <input 
          type="checkbox" 
          value={filter}
          checked={selectedFilters.includes(filter)}
          onChange={() => handleFilterChange(filter)}
        />
        {filter}
      </label>
    ))}

    <button onClick={applyFilters}>Apply Filters</button>
  </div>

  );
}

export default FilterSidebar;

