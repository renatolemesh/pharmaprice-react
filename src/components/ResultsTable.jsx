import { ConstructionIcon, CopyIcon } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';

const ResultsTable = ({ results, selectedPharmacies = [], type }) => {
  const [sortColumn, setSortColumn] = useState('preco');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortedResults, setSortedResults] = useState([]);
  const [copyIconColors, setCopyIconColors] = useState({}); // Objeto para armazenar as cores dos ícones

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
    setCopyIconColors((prev) => ({ ...prev, [ean]: 'text-green-500' })); // Muda a cor do ícone correspondente

    setTimeout(() => {
      setCopyIconColors((prev) => ({ ...prev, [ean]: 'text-gray-500' })); // Retorna a cor original após 500ms
    }, 500);
  };

  return (
    <div className="p-4 overflow-y-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort('nome_farmacia')}>
              FARMÁCIA
              {sortColumn === 'nome_farmacia' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort('descricao')}>
              DESCRIÇÃO
              {sortColumn === 'descricao' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort('EAN')}>
              EAN
              {sortColumn === 'EAN' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort('preco')}>
              PREÇO
              {sortColumn === 'preco' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
            <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort('data')}>
              DATA
              {sortColumn === 'data' && (
                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result, index) => (
            <tr key={index} className="cursor-pointer hover:bg-gray-200" onClick={() => window.open(getCompleteUrl(result.nome_farmacia, result.link), '_blank')}>
              <td className="border border-gray-300 px-4 py-2">{result.nome_farmacia}</td>
              <td className="border border-gray-300 px-4 py-2">{result.descricao}</td>
              <td className="border border-gray-300 px-4 py-2 flex items-center">
                {result.EAN}
                <CopyIcon
                  className={`w-4 h-4 ml-auto cursor-pointer ${copyIconColors[result.EAN] || 'text-gray-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result.EAN);
                  }} />
              </td>
              <td className="border border-gray-300 px-4 py-2">R$ {result.preco}</td>
              <td className="border border-gray-300 px-4 py-2">{formatDate(result.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
