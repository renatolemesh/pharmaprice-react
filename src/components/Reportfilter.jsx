import React, { useState, useEffect, useRef } from 'react';

const pharmacies = [
  { name: "Raia", value: 1 },
  { name: "Nissei", value: 2 },
  { name: "Morifarma", value: 3 },
  { name: "Unipreco", value: 4 },
  { name: "Callfarma", value: 5 },
  { name: "Preço Popular", value: 6 },
  { name: "Panvel", value: 7 },
  { name: "Pague menos", value: 8 }
];

const ReportFilter = ({ onGenerateReport }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPharmacies, setSelectedPharmacies] = useState([]);
  const [priceType, setPriceType] = useState('historical');
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPharmacyDropdown, setShowPharmacyDropdown] = useState(false);
  const dropdownRef = useRef(null); // Referência para o dropdown

  const handlePharmacyChange = (pharmacy) => {
    setSelectedPharmacies(prevSelected => 
      prevSelected.includes(pharmacy) ? 
      prevSelected.filter(p => p !== pharmacy) : 
      [...prevSelected, pharmacy]
    );
  };

  const handleGenerateClick = () => {
    setErrorMessage('');
    onGenerateReport({ startDate, endDate, selectedPharmacies, priceType, query });
  };

  // Função para lidar com cliques fora do dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowPharmacyDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <div className="flex space-x-4 mb-4">
        <div className="relative" ref={dropdownRef}> {/* Adiciona a referência aqui */}
          <button
            onClick={() => setShowPharmacyDropdown(!showPharmacyDropdown)}
            className="px-4 py-2 border rounded-md"
          >
            Farmácias
          </button>
          {showPharmacyDropdown && (
            <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-md z-10">
              <ul>
                {pharmacies.map((pharmacy) => (
                  <li key={pharmacy.value} className="p-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={pharmacy.value}
                        checked={selectedPharmacies.includes(pharmacy.value)}
                        onChange={() => handlePharmacyChange(pharmacy.value)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span>{pharmacy.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <select
          value={priceType}
          onChange={(e) => setPriceType(e.target.value)}
          className="px-4 py-2 border rounded-md"
          id="priceTypeInput"
        >
          <option value="current">Preço Atual</option>
          <option value="historical">Preço Histórico</option>
        </select>
        {priceType === 'historical' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border rounded-md"
            />
          </>
        )}
      </div>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Pesquisar por descrição"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-md"
        />
        <button
          onClick={handleGenerateClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md ml-2"
        >
          Gerar
        </button>
      </div>
      {errorMessage && (
        <p className="text-red-500 mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default ReportFilter;
