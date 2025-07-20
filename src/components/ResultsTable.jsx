import { ConstructionIcon, CopyIcon } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

const ResponsiveResultsTable = ({ results, selectedPharmacies = [], type }) => {
  const [sortColumn, setSortColumn] = useState('preco');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortedResults, setSortedResults] = useState([]);
  const [copyIconColors, setCopyIconColors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const sortResults = (results, column, direction) => {
    const sorted = [...results].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      if (column === 'preco') {
        aValue = parseFloat(aValue.replace(',', '.'));
        bValue = parseFloat(bValue.replace(',', '.'));
      } else if (column === 'data') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      return direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return sorted;
  };

  useEffect(() => {
    setSortedResults(sortResults(results, sortColumn, sortDirection));
  }, [results, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const farmaciaIdMap = {
    'Raia': 1,
    'Nissei': 2,
    'Morifarma': 3,
    'Unipreco': 4,
    'Callfarma': 5,
    'PP': 6,
    'Panvel': 7,
    'Pague menos': 8,
  };

  const getCompleteUrl = (farmaciaNome, link) => {
    const farmaciaId = farmaciaIdMap[farmaciaNome];
    const baseUrls = {
      1: 'https://www.drogaraia.com.br',
      2: 'https://www.farmaciasnissei.com.br',
      3: 'https://www.morifarma.com.br',
      4: 'https://www.farmaciasunipreco.com.br',
      5: 'https://www.callfarma.com.br',
      6: 'https://www.precopopular.com.br',
      7: 'https://www.panvel.com/panvel',
      8: 'https://www.paguemenos.com.br',
    };

    const baseUrl = baseUrls[farmaciaId];
    if (!baseUrl) {
      console.error(`Base URL not found for farmaciaNome: ${farmaciaNome}`);
      return '#';
    }

    const sanitizedLink = link.replace(/^\/+/, '');
    if (farmaciaId === 6) {
      return `${baseUrl}/${sanitizedLink}/p`;
    }

    if (sanitizedLink.startsWith('https://www.farmaciasapp.com.br')) {
      return sanitizedLink;
    }
    
    return `${baseUrl}/${sanitizedLink}`;
  };

  const copyToClipboard = (ean) => {
    navigator.clipboard.writeText(ean);
    setCopyIconColors((prev) => ({ ...prev, [ean]: 'text-green-500' }));

    setTimeout(() => {
      setCopyIconColors((prev) => ({ ...prev, [ean]: 'text-gray-500' }));
    }, 500);
  };

  const handleRowClick = (result) => {
    window.open(getCompleteUrl(result.nome_farmacia, result.link), '_blank');
  };

  // Mobile Card Layout
  const MobileCard = ({ result, index }) => (
    <div 
      key={index} 
      className="bg-white border border-gray-300 rounded-lg p-4 mb-3 shadow-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100"
      onClick={() => handleRowClick(result)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-blue-600">{result.nome_farmacia}</h3>
        <span className="text-lg font-bold text-green-600">R$ {result.preco}</span>
      </div>
      
      <p className="text-gray-700 text-sm mb-2 line-clamp-2">{result.descricao}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <span className="mr-2">EAN: {result.EAN}</span>
          <CopyIcon
            className={`w-4 h-4 cursor-pointer ${copyIconColors[result.EAN] || 'text-gray-500'}`}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(result.EAN);
            }}
          />
        </div>
        <span>{formatDate(result.data)}</span>
      </div>
    </div>
  );

  // Desktop Table Layout
  const DesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 min-w-[800px]">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-3 py-2 cursor-pointer text-left text-sm font-medium" onClick={() => handleSort('nome_farmacia')}>
              FARMÁCIA
              {sortColumn === 'nome_farmacia' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-3 py-2 cursor-pointer text-left text-sm font-medium" onClick={() => handleSort('descricao')}>
              DESCRIÇÃO
              {sortColumn === 'descricao' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-3 py-2 cursor-pointer text-left text-sm font-medium" onClick={() => handleSort('EAN')}>
              EAN
              {sortColumn === 'EAN' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-3 py-2 cursor-pointer text-left text-sm font-medium" onClick={() => handleSort('preco')}>
              PREÇO
              {sortColumn === 'preco' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-3 py-2 cursor-pointer text-left text-sm font-medium" onClick={() => handleSort('data')}>
              DATA
              {sortColumn === 'data' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result, index) => (
            <tr 
              key={index} 
              className="cursor-pointer hover:bg-gray-100 active:bg-gray-200" 
              onClick={() => handleRowClick(result)}
            >
              <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{result.nome_farmacia}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm max-w-xs">
                <div className="truncate" title={result.descricao}>
                  {result.descricao}
                </div>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="mr-2">{result.EAN}</span>
                  <CopyIcon
                    className={`w-4 h-4 cursor-pointer flex-shrink-0 ${copyIconColors[result.EAN] || 'text-gray-500'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(result.EAN);
                    }}
                  />
                </div>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm font-semibold text-green-600">R$ {result.preco}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm">{formatDate(result.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-2 sm:p-4">
      {/* Sort controls for mobile */}
      {isMobile && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por:
          </label>
          <div className="flex flex-wrap gap-2">
            <select 
              value={sortColumn} 
              onChange={(e) => setSortColumn(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="preco">Preço</option>
              <option value="nome_farmacia">Farmácia</option>
              <option value="descricao">Descrição</option>
              <option value="EAN">EAN</option>
              <option value="data">Data</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              {sortDirection === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </button>
          </div>
        </div>
      )}

      {/* Conditional rendering based on screen size */}
      {isMobile ? (
        <div className="space-y-3">
          {sortedResults.map((result, index) => (
            <MobileCard key={index} result={result} index={index} />
          ))}
        </div>
      ) : (
        <DesktopTable />
      )}

      {/* Empty state */}
      {sortedResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ConstructionIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  );
};

export default ResponsiveResultsTable;

