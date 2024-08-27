import React, { useState, useEffect } from 'react';
import EventBus from '../EventBus';


function CategoryTag() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://poc-midflorida.onrender.com/categories'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Network error fetching categories!');
        }
        const data = await response.json();
        // Concat "ALL" in categories array
        setCategories(['All', ...data.categories]);
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Handle error (e.g., display an error message)
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    EventBus.emit('categoryUpdated', category);
  };

  return (
    <div className='CategoryTag'>
      {categories.map(category => (
        <button 
          key={category} 
          onClick={() => category === "All" ?handleCategoryClick(null) : handleCategoryClick(category)}
          className={activeCategory == null? (category === "All" ? 'active' :''): (activeCategory === category ? 'active' : '')}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryTag;
