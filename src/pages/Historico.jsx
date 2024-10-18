import React, { useState } from 'react';
import PriceHistoryFilter from '../components/PriceHistoryFilter';
import PriceHistoryResults from '../components/PriceHistoryResults';
import { fetchPriceHistory } from '../services/Api';
import Pagination from '../components/Pagination';

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
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </>
      )}
      {loading && <p>Carregando...</p>}
    </div>
  );
};

export default Historico;