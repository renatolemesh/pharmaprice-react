import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPages = () => {
    const pages = [];
    const startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(startPage + 4, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-4 py-2 mx-1 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-center mt-4">
      {currentPage > 1 && (
        <button
          className="px-4 py-2 mx-1 bg-gray-200 rounded"
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </button>
      )}
      {renderPages()}
      {currentPage < totalPages && (
        <button
          className="px-4 py-2 mx-1 bg-gray-200 rounded"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próxima
        </button>
      )}
    </div>
  );
};

export default Pagination;