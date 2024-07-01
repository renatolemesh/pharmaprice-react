import React, { useState } from 'react';

const PriceHistoryFilter = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    if (!query && !startDate && !endDate && !selectedPharmacy) {
      setErrorMessage('Preencha pelo menos um filtro para realizar a pesquisa.');
      return;
    }

    setErrorMessage('');

    const isEan = /^\d{5,15}$/.test(query);

    onSearch(query, isEan ? 'ean' : 'descricao', startDate, endDate, selectedPharmacy);
  };

  return (
    <div className="flex flex-col p-4 space-y-4">
      <div className="flex">
        <input
          type="text"
          placeholder="Pesquisar por EAN ou Descrição..."
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
      <div className="flex space-x-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          value={selectedPharmacy}
          onChange={(e) => setSelectedPharmacy(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Selecione a Farmácia</option>
          <option value="1">Raia</option>
          <option value="2">Nissei</option>
          <option value="3">Morifarma</option>
          <option value="4">Unipreco</option>
          <option value="5">Callfarma</option>
        </select>
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default PriceHistoryFilter;




