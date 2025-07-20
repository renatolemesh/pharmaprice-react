import React, { useState, useEffect } from 'react';
import { TrendingUpIcon, CalendarIcon, CopyIcon } from 'lucide-react';

const ResponsivePriceHistoryResults = ({ results }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [copyIconColors, setCopyIconColors] = useState({});
  let searched = window.searched;

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
    const dateParts = dateString.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${day}/${month}/${year}`;
  };

  const copyToClipboard = (ean) => {
    navigator.clipboard.writeText(ean);
    setCopyIconColors((prev) => ({ ...prev, [ean]: 'text-green-500' }));

    setTimeout(() => {
      setCopyIconColors((prev) => ({ ...prev, [ean]: 'text-gray-500' }));
    }, 500);
  };

  // Mobile Card Layout
  const MobileCard = ({ result, index }) => (
    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 mb-4 shadow-sm">
      {/* Header with pharmacy and EAN */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-blue-600 mb-1">{result.nome_farmacia}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">EAN: {result.EAN}</span>
            <CopyIcon
              className={`w-4 h-4 cursor-pointer ${copyIconColors[result.EAN] || 'text-gray-500'}`}
              onClick={() => copyToClipboard(result.EAN)}
            />
          </div>
        </div>
      </div>
      
      {/* Product description */}
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">{result.descricao}</p>
      
      {/* Price history */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-800 flex items-center">
          <TrendingUpIcon className="w-4 h-4 mr-1" />
          Histórico de Preços
        </h4>
        <div className="space-y-2">
          {result.precos.map((precoData, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-semibold text-green-600">R$ {precoData.preco}</span>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {formatDate(precoData.data)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop Table Layout
  const DesktopTable = () => {
    if (window.searched) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 min-w-[900px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Farmácia</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Descrição</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">EAN</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Preços</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Datas</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-0 align-top">
                    <div className="px-3 py-2 font-medium">{result.nome_farmacia}</div>
                  </td>
                  <td className="border border-gray-300 p-0 align-top">
                    <div className="px-3 py-2 text-sm max-w-xs">
                      <div className="line-clamp-3" title={result.descricao}>
                        {result.descricao}
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0 align-top">
                    <div className="px-3 py-2 text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{result.EAN}</span>
                        <CopyIcon
                          className={`w-4 h-4 cursor-pointer flex-shrink-0 ${copyIconColors[result.EAN] || 'text-gray-500'}`}
                          onClick={() => copyToClipboard(result.EAN)}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-300 p-0">
                    {result.precos.map((precoData, i) => (
                      <div key={i} className={`px-3 py-2 text-sm font-semibold text-green-600 ${i < result.precos.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        R$ {precoData.preco}
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 p-0">
                    {result.precos.map((precoData, i) => (
                      <div key={i} className={`px-3 py-2 text-sm text-gray-600 ${i < result.precos.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        {formatDate(precoData.data)}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  // Compact Mobile Table (alternative layout)
  const CompactMobileTable = () => (
    <div className="space-y-4">
      {results.map((result, index) => (
        <div key={index} className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          {/* Product header */}
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-blue-600">{result.nome_farmacia}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{result.descricao}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-1">EAN: {result.EAN}</span>
                  <CopyIcon
                    className={`w-2 h-2 cursor-pointer ${copyIconColors[result.EAN] || 'text-gray-500'}`}
                    onClick={() => copyToClipboard(result.EAN)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Price history table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-25">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Preço</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Data</th>
                </tr>
              </thead>
              <tbody>
                {result.precos.map((precoData, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="px-3 py-2 text-sm font-semibold text-green-600">
                      R$ {precoData.preco}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {formatDate(precoData.data)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  if (searched && (!results || results.length === 0)) {
    return (
      <div className="p-4 text-center text-gray-500">
        <TrendingUpIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhum histórico de preços encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">

      {/* Conditional rendering based on screen size */}
      {isMobile ? (
        <div className="space-y-1">
          {/* Toggle between card and compact table view */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">Visualização móvel otimizada</div>
          </div>
          <CompactMobileTable />
        </div>
      ) : (
        <DesktopTable />
      )}
    </div>
  );
};

export default ResponsivePriceHistoryResults;

