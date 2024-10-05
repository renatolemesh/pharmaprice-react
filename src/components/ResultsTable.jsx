import { ConstructionIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ResultsTable = ({ results, selectedPharmacies = [], type }) => {
  const [sortColumn, setSortColumn] = useState('preco');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortedResults, setSortedResults] = useState([]);

  // Função para formatar a data no formato DD/MM/AAAA
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

  // Função para ordenar os resultados
  const sortResults = (results, column, direction) => {
    const sorted = [...results].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      // Convertendo os valores de preço para números antes de comparar
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

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  };

  // Ordenar os resultados ao carregar a tabela ou quando o critério de ordenação mudar
  useEffect(() => {
    setSortedResults(sortResults(results, sortColumn, sortDirection));
  }, [results, sortColumn, sortDirection]);

  // Função para alternar a coluna e direção de ordenação
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
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
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{result.nome_farmacia}</td>
              <td className="border border-gray-300 px-4 py-2">{result.descricao}</td>
              <td className="border border-gray-300 px-4 py-2">{result.EAN}</td>
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
