import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    if (!query.trim()) {
      setErrorMessage('Por favor, preencha o campo de pesquisa.');
      return;
    }

    setErrorMessage('');

    // Check if query is numeric and has 5 to 15 characters (typical length of EAN)
    const isEan = /^\d{5,15}$/.test(query);

    // Determine the type of search based on the format of the query
    const searchType = isEan ? 'ean' : 'descricao';

    onSearch(query, searchType);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
    </div>
  );
};

export default SearchBar;
