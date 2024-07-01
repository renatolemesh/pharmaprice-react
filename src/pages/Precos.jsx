import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsTable from '../components/ResultsTable';
import { fetchPrecos } from '../services/Api';

const Precos = () => {
  const [results, setResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    searchType: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleSearch = (query, searchType) => {
    setSearchFilters({ query, searchType });
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { resultsData, totalPages } = await fetchPrecos(searchFilters, currentPage);
        setResults(resultsData);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchFilters.query) {
      fetchData();
    }
  }, [searchFilters, currentPage]);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {loading && <p>Carregando...</p>}
      {!loading && results.length > 0 && (
        <ResultsTable results={results} />
      )}
    </div>
  );
};

export default Precos;