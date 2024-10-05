import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { fetchFilteredDescriptions, fetchDescriptions } from '../services/Api';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const loadDescriptions = async () => {
      try {
        const data = await fetchFilteredDescriptions();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching from api:', error);
      }
    };

    loadDescriptions();
  }, []);

  const handleSearch = (searchQuery, searchType) => {
    if (!searchQuery.trim()) {
      setErrorMessage('Por favor, preencha o campo de pesquisa.');
      return;
    }

    setErrorMessage('');
    onSearch(searchQuery, searchType);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.descricao);
    setSuggestions([]); // Limpa as sugestões após a seleção
    handleSearch(suggestion.descricao, 'descricao'); // Pesquisa diretamente
  };

  const fetchSuggestions = async (value) => {
    if (value.length <= 2) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await fetchFilteredDescriptions(value);
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching filtered descriptions:', error);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 1000),
    []
  );

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchSuggestions(value);
  };

  // Fecha as sugestões se clicar fora
  const handleClickOutside = (e) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
      setSuggestions([]); // Limpa as sugestões
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col p-4">
      <div className="flex">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={handleQueryChange}
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={() => handleSearch(query, /^\d{5,15}$/.test(query) ? 'ean' : 'descricao')}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md focus:outline-none"
        >
          Pesquisar
        </button>
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-2">{errorMessage}</p>
      )}
      {suggestions.length > 0 && (
        <ul ref={suggestionsRef} className="border mt-2 rounded-md max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              {suggestion.descricao}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
