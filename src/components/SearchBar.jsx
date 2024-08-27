import React, { useState } from 'react';
import EventBus from '../EventBus'; 


function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    EventBus.emit('searchUpdated', newSearchTerm); 
  };

  return (
    <div className='SearchBar'>
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={handleInputChange} 
      />
    </div>
  );
}

export default SearchBar;
