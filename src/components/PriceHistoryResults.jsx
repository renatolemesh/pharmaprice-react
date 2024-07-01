  import React from 'react';

  const formatDate = (dateString) => {
    const dateParts = dateString.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    // Construir a data no formato dd/mm/aaaa
    return `${day}/${month}/${year}`;
  };

  const PriceHistoryResults = ({ results }) => {
    return (
      <div className="p-4 overflow-y-auto">
        <table className="w-full border-collapse border border-gray-300">
          {results.length > 0 && (
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Farmácia</th>
                <th className="border border-gray-300 px-4 py-2">Descrição</th>
                <th className="border border-gray-300 px-4 py-2">EAN</th>
                <th className="border border-gray-300 px-4 py-2">Preços</th>
                <th className="border border-gray-300 px-4 py-2">Datas</th>
              </tr>
            </thead>
          )}
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-0">
                  <div className="px-4 py-2">{result.nome_farmacia}</div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="px-4 py-2">{result.descricao}</div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="px-4 py-2">{result.EAN}</div>
                </td>
                <td className="border border-gray-300 p-0">
                  {result.precos.map((precoData, i) => (
                    <div key={i} className="px-4 py-2 border-b border-gray-300">
                      R$ {precoData.preco}
                    </div>
                  ))}
                </td>
                <td className="border border-gray-300 p-0">
                  {result.precos.map((precoData, i) => (
                    <div key={i} className="px-4 py-2 border-b border-gray-300">
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
  };

  export default PriceHistoryResults;









