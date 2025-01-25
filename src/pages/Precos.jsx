import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsTable from '../components/ResultsTable';
import { fetchPrecos } from '../services/Api';
import Pagination from '../components/Pagination';

const Precos = () => {
  const [results, setResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    searchType: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasSearched, setHasSearched] = useState(false); // Novo estado para saber se já pesquisou

  const handleSearch = (query, searchType) => {
    setSearchFilters({ query, searchType });
    setCurrentPage(1);
    setHasSearched(true); // Marca que a pesquisa foi feita
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Atualiza a página atual
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
      {/* Botões de exportação */}
      <SearchBar onSearch={handleSearch} />
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <img src="/gifs/rolling.svg" alt="Carregando..." className="w-35 h-auto" />
        </div>
      ) : (
        hasSearched && ( // Só mostra a mensagem se já foi feito pelo menos uma pesquisa
          
          results.length > 0 ? (
            <>
              <ResultsTable results={results} />
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </>
          ) : (
            <div className="flex justify-center items-center h-screen">
              <p className="text-xl text-gray-600">Nenhum resultado encontrado.</p>
            </div>
          )
        )
      )}
    </div>
  );
};

export default Precos;
