// Pagination.jsx
import React, { useState, useEffect } from 'react';
import EventBus from '../EventBus';

const Pagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Extract page from URL without query-string library
    const queryParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(queryParams.get('p')) || 1;
    setCurrentPage(initialPage);

    const handlePaginationData = (data) => {
      setTotalPages(data.pages);
    };

    // Listen for pagination data from API response
    EventBus.on('paginationData', handlePaginationData);
    // Listen for events
    EventBus.on('searchUpdated', resetPage);
    EventBus.on('categoryUpdated', resetPage);
    EventBus.on('filtersUpdated', resetPage);
    return () => {
        EventBus.off('searchUpdated', resetPage);
        EventBus.off('categoryUpdated', resetPage);
        EventBus.off('filtersUpdated', resetPage);
      EventBus.off('paginationData', handlePaginationData);
    };
  }, []);

  const resetPage = () => {
    handlePageChange(1)
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // Update URL without query-string library
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('p', newPage);
    window.history.pushState({}, '', currentUrl.toString());

    // Emit event to trigger data refetch in DataList
    EventBus.emit('pageChanged', newPage); 
  };

  return (
    <ul className="pagination">
      {currentPage > 1 && (
        <li onClick={() => handlePageChange(currentPage - 1)}>Previous</li>
      )}

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
        <li
          key={page}
          onClick={() => handlePageChange(page)}
          className={currentPage === page ? 'active' : ''}
        >
          {page}
        </li>
      ))}

      {currentPage < totalPages && (
        <li onClick={() => handlePageChange(currentPage + 1)}>Next</li>
      )}
    </ul>
  );
};

export default Pagination;
