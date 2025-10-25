import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { fetchFilteredDescriptions } from '../services/Api';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isSearchingRef = useRef(false);
  const suggestionsRef = useRef(null);

  const loadDescriptions = async (value) => {
    // Don't load if user just clicked search button
    if (isSearchingRef.current) {
      return;
    }

    if (value.length > 2) {
      try {
        const data = await fetchFilteredDescriptions(value);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching from api:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const debouncedLoadDescriptions = useCallback(
    debounce(loadDescriptions, 1000),
    []
  );

  useEffect(() => {
    debouncedLoadDescriptions(query);
    return () => debouncedLoadDescriptions.cancel();
  }, [query, debouncedLoadDescriptions]);

  const handleSearch = (searchQuery, searchType) => {
    if (!searchQuery.trim()) {
      setErrorMessage('Por favor, preencha o campo de pesquisa.');
      return;
    }

    setErrorMessage('');
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Set ref to block suggestions loading
    isSearchingRef.current = true;
    
    // Cancel any pending debounced calls
    debouncedLoadDescriptions.cancel();
    
    onSearch(searchQuery, searchType);
    
    // Reset the ref after a short delay to allow new searches
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 100);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.descricao);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Use the same logic as handleSearch
    isSearchingRef.current = true;
    debouncedLoadDescriptions.cancel();
    
    onSearch(suggestion.descricao, 'descricao');
    
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 100);
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Allow suggestions to load again when user types
    isSearchingRef.current = false;
    
    // Reset error message when user types
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleClickOutside = (e) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query, /^\d{5,15}$/.test(query) ? 'ean' : 'descricao');
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col p-4 relative">
      <div className="flex">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Show suggestions again when input is focused (if there are any and not just searched)
            if (suggestions.length > 0 && !isSearchingRef.current) {
              setShowSuggestions(true);
            }
          }}
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={() => handleSearch(query, /^\d{5,15}$/.test(query) ? 'ean' : 'descricao')}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none transition-colors"
        >
          Pesquisar
        </button>
      </div>
      
      {errorMessage && (
        <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionsRef} 
          className="absolute top-full left-4 right-4 bg-white border mt-1 rounded-md max-h-60 overflow-y-auto shadow-lg z-50"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="p-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0"
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