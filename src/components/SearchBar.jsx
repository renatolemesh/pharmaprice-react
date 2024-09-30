import React, { useState, useEffect } from 'react';
import { fetchFilteredDescriptions } from '../services/Api';
import { saveDescriptions, fetchDescriptions } from '../services/Db';


const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadDescriptions = async () => {
      try {
        const data = await fetchDescriptions(); // Carrega do IndexedDB
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching from IndexedDB:', error);
      }
    };

    loadDescriptions();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) {
      setErrorMessage('Por favor, preencha o campo de pesquisa.');
      return;
    }

    setErrorMessage('');

    // Verifica se a consulta é numérica e tem entre 5 e 15 caracteres (típico de EAN)
    const isEan = /^\d{5,15}$/.test(query);
    const searchType = isEan ? 'ean' : 'descricao';

    onSearch(query, searchType);
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.descricao); // Define a descrição clicada como a consulta
    setSuggestions([]); // Limpa as sugestões após a seleção
  };

  const handleQueryChange = async (e) => {
    setQuery(e.target.value);
    
    if (e.target.value.length > 2) {
      try {
        const data = await fetchFilteredDescriptions(e.target.value); // Busca sob demanda
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching filtered descriptions:', error);
      }
    } else {
      setSuggestions([]); // Limpa sugestões se a consulta for curta
    }
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={handleQueryChange} // Usa a nova função
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md focus:outline-none"
        >
          Pesquisar
        </button>
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-2">{errorMessage}</p>
      )}
      {suggestions.length > 0 && (
        <ul className="border mt-2 rounded-md max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)} // Passa o objeto completo
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              {suggestion.descricao} {/* Acessa a propriedade descricao */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
