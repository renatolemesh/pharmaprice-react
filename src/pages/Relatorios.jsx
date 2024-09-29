import React, { useState } from 'react';
import ReportFilter from '../components/Reportfilter';
import ResultsTable from '../components/ResultsTable';
import PriceHistoryResults from '../components/PriceHistoryResults';
import * as XLSX from 'xlsx';
import { CSVLink } from 'react-csv';
import { fetchReportData, exportReportData } from '../services/Api';

const Relatorios = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleGenerateReport = async (newFilters, page = 1) => {
    setLoading(true);
    try {
      const data = await fetchReportData(newFilters, page);
      setResults(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setFilters(newFilters);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    handleGenerateReport(filters, page);
  };

  const renderPagination = () => {
    const renderPages = () => {
      const pages = [];
      const startPage = Math.max(currentPage - 2, 1);
      const endPage = Math.min(startPage + 4, totalPages);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            className={`px-4 py-2 mx-1 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }

      return pages;
    };

    return (
      <div className="flex justify-center mt-4">
        {currentPage > 1 && (
          <button
            className="px-4 py-2 mx-1 bg-gray-200 rounded"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Anterior
          </button>
        )}
        {renderPages()}
        {currentPage < totalPages && (
          <button
            className="px-4 py-2 mx-1 bg-gray-200 rounded"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Próxima
          </button>
        )}
      </div>
    );
  };

  const exportToExcel = async () => {
    try {
      const data = await exportReportData(filters);
      const formattedData = filters.priceType === 'current' 
        ? formatDataForExport(data.data) 
        : formatHistoricalDataForExport(data.data);
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
      XLSX.writeFile(workbook, "relatorio.xlsx");
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
    }
  };

  const exportToCSV = async () => {
    try {
      const data = await exportReportData(filters);
      const formattedData = filters.priceType === 'current' 
        ? formatDataForExport(data.data) 
        : formatHistoricalDataForExport(data.data);
      const csv = convertToCSV(formattedData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "relatorio.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar para CSV:', error);
    }
  };

  const formatDataForExport = (data) => {
    return data.map(item => ({
      Farmácia: item.nome_farmacia,
      Descrição: item.descricao,
      EAN: item.EAN,
      Preços: item.preco,
      Datas: formatarDataBrasileira(item.data),
    }));
  };

  const formatHistoricalDataForExport = (data) => {
    const formattedData = [];
    data.forEach(item => {
      item.precos.forEach(preco => {
        formattedData.push({
          Farmácia: item.nome_farmacia,
          Descrição: item.descricao,
          EAN: item.EAN,
          Preço: preco.preco,
          Data: formatarDataBrasileira(preco.data),
        });
      });
    });
    return formattedData;
  };

  const formatarDataBrasileira = (data) => {
    const dataObj = new Date(data);
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(',') + '\n';
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    return header + csv;
  };

  return (
    <div>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={exportToExcel}
          className="ml-5 px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Exportar para Excel
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md"
        >
          Exportar para CSV
        </button>
      </div>
      <ReportFilter onGenerateReport={handleGenerateReport} />
      {loading ? (
        <p>Carregando...</p>
      ) : (
        results.length > 0 && (
          <>
            {filters.priceType === 'current' ? (
              <ResultsTable results={results} />
            ) : (
              <PriceHistoryResults results={results} />
            )}
            {renderPagination()}
          </>
        )
      )}
    </div>
  );
};

export default Relatorios;
