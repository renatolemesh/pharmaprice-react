import React, { useState } from 'react';
import PriceHistoryFilter from '../components/PriceHistoryFilter';
import PriceHistoryResults from '../components/PriceHistoryResults';
import { fetchPriceHistory } from '../services/Api';
import Pagination from '../components/Pagination';

const Historico = () => {
  const [results, setResults] = useState({ data: [] }); // Inicializa como um objeto com a chave 'data'
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
  const [hasSearched, setHasSearched] = useState(false); // Marca se já foi feita a pesquisa

  const handleSearch = async (query, searchType, startDate, endDate, selectedPharmacy, page = 1) => {
    setLoading(true);
    setHasSearched(true); // Marca que já fez a pesquisa
    try {
      const data = await fetchPriceHistory(query, searchType, startDate, endDate, selectedPharmacy, page);
      setResults(data); // 'data' já tem a chave 'data' com os resultados
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
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <img src="public/gifs/rolling.svg" alt="Carregando..." className="w-35 h-auto" />
        </div>
      ) : (
        hasSearched && ( // Só exibe a mensagem ou os resultados se já tiver feito a pesquisa
          results?.data?.length > 0 ? ( // Verifique se a chave 'data' tem itens
            <>
              <PriceHistoryResults results={results.data} />
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

export default Historico;
