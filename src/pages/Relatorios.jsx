import React, { useState } from 'react';
import ReportFilter from '../components/Reportfilter';
import ResultsTable from '../components/ResultsTable';
import PriceHistoryResults from '../components/PriceHistoryResults';
import Pagination from '../components/Pagination';
import * as XLSX from 'xlsx';
import { fetchReportData, exportReportData } from '../services/Api';

const Relatorios = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasFetched, setHasFetched] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleGenerateReport = async (newFilters, page = 1) => {
    setLoading(true);
    setHasFetched(true);
    try {
      const data = await fetchReportData(newFilters, page);
      if (data.message === "Nenhum resultado encontrado.") {
        setResults([]);
      } else {
        setResults(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
      }
      setFilters(newFilters);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    handleGenerateReport(filters, page);
  };

  const renderResults = () => {
    // Show loading spinner
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <img src="/gifs/rolling.svg" alt="Carregando..." className="w-35 h-auto" />
        </div>
      );
    }

    // Don't show anything before first search
    if (!hasFetched) {
      return null;
    }

    // Show "no results" message after search
    if (results.length === 0) {
      return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-gray-600">Nenhum resultado encontrado.</p>
        </div>
      );
    }

    // Show results
    return filters.priceType === 'current' ? (
      <ResultsTable results={results} />
    ) : (
      <PriceHistoryResults results={results} />
    );
  };

  const renderPagination = () => {
    // Only show pagination if we have results
    if (!hasFetched || results.length === 0) {
      return null;
    }

    return (
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    );
  };

  const exportToExcel = async () => {
    setExporting(true);
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
      alert('Erro ao exportar para Excel. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
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
      alert('Erro ao exportar para CSV. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const formatDataForExport = (data) => {
    return data.map(item => ({
      Farmácia: item.nome_farmacia,
      Descrição: item.descricao,
      Laboratório: item.laboratorio || '',
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
          Laboratório: item.laboratorio || '',
          EAN: item.EAN,
          Preço: preco.preco,
          Data: formatarDataBrasileira(preco.data),
        });
      });
    });
    return formattedData;
  };

  const formatarDataBrasileira = (data) => {
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  };

  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(',') + '\n';
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    return header + csv;
  };

  return (
    <div className="relative">
      {/* Filter Section */}
      <ReportFilter onGenerateReport={handleGenerateReport} />
      
      {/* Export Buttons - Only show when there are results */}
      {results.length > 0 && !loading && (
        <div className="flex justify-end mt-4 space-x-4 mr-5">
          <button 
            onClick={exportToExcel} 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : 'Exportar para Excel'}
          </button>
          <button 
            onClick={exportToCSV} 
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : 'Exportar para CSV'}
          </button>
        </div>
      )}

      {/* Loading indicator for exports */}
      {exporting && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2 z-50">
          <img src="/gifs/rolling.svg" alt="Carregando..." className="w-8 h-8" />
          <span className="text-sm font-medium">Exportando dados...</span>
        </div>
      )}

      {/* Results Section */}
      {renderResults()}
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default Relatorios;