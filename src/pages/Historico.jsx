import React, { useState } from 'react';
import PriceHistoryFilter from '../components/PriceHistoryFilter';
import PriceHistoryResults from '../components/PriceHistoryResults';
import { fetchPriceHistory } from '../services/Api';

const Historico = () => {
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    searchType: '',
    startDate: '',
    endDate: '',
    selectedPharmacy: ''
  });

  const handleSearch = async (query, searchType, startDate, endDate, selectedPharmacy, page = 1) => {
    setLoading(true);
    try {
      const data = await fetchPriceHistory(query, searchType, startDate, endDate, selectedPharmacy, page);
      setResults(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setFilters({ query, searchType, startDate, endDate, selectedPharmacy });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    handleSearch(filters.query, filters.searchType, filters.startDate, filters.endDate, filters.selectedPharmacy, page);
  };

  return (
    <div>
      <PriceHistoryFilter onSearch={handleSearch} />
      {results.length > 0 && (
        <>
          <PriceHistoryResults results={results} />
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 mx-1 bg-gray-200 rounded"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num}
                className={`px-4 py-2 mx-1 ${num + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handlePageChange(num + 1)}
              >
                {num + 1}
              </button>
            ))}
            <button
              className="px-4 py-2 mx-1 bg-gray-200 rounded"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        </>
      )}
      {loading && <p>Carregando...</p>}
    </div>
  );
};

export default Historico;