
import { useEffect, useState } from 'react';
import EventBus from '../EventBus';

function DataList() {
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);


  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        // Construct API URL based on current state from events
        console.log(currentSearchTerm,"currentSearchTerm")
        let apiUrl = `https://poc-midflorida.onrender.com/data?search=${currentSearchTerm}`;
        console.log("STARTED API",apiUrl)
        if(currentPage){
            apiUrl += `&p=${currentPage}`;
        }
        if (currentCategory) {
            apiUrl += `&category=${currentCategory}`;
          }
          // Add comma separayed filter, use only values
          const filters = Object.values(currentFilters);
          if (filters.length > 0) {
              apiUrl += `&filter=${filters.join(',')}`;
              
          };
          
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error('Network error!');
      }
      const data = await response.json();
      setFilteredData(data.data);
      EventBus.emit('paginationData', { pages: data.pages }); 
  } catch (err) {
      setError(err.message);
  } finally {
      setIsLoading(false);
  }
};
useEffect(()=>{
  fetchData();
},[currentSearchTerm,currentCategory,currentFilters,currentPage])
  useEffect(() => {


    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
    };
const handleSearchUpdate = (newSearchTerm) => { 
    setCurrentSearchTerm(newSearchTerm);
  
};

const handleCategoryUpdate = (newCategory) => {
    setCurrentCategory(newCategory);
    
};

const handleFiltersUpdate = (newFilters) => {
    setCurrentFilters(newFilters);

};

// Listen for events
EventBus.on('searchUpdated', handleSearchUpdate);
EventBus.on('categoryUpdated', handleCategoryUpdate);
EventBus.on('pageChanged', handlePageChange);
EventBus
.on('filtersUpdated', handleFiltersUpdate);

   // Initial data fetch (optional, if you want to load data on component mount)
   fetchData();
   
   return () => {
    // Clean up event listeners on component unmount
    EventBus.off('pageChanged', handlePageChange);
       EventBus.off('searchUpdated', handleSearchUpdate);
       EventBus.off('categoryUpdated', handleCategoryUpdate);
       EventBus.off('filtersUpdated', handleFiltersUpdate);
    };
}, []);

return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      <ul>
        {console.log(filteredData)}
        {filteredData.map(item => (
  
      <li key={item.id} className="data-item">
        <h3>{item.headline}</h3>
        <p>{item.Description}</p>
        <p><span className="label">Category:</span> {item.category}</p>
        <p><span className="label">Date:</span> {item.Date}</p>
        <p><span className="label">Author:</span> {item.authorName}</p>
      </li>
      
        ))}
      </ul>
    </div>
  );
}

export default DataList;
