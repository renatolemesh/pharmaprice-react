import React, { useState } from 'react';
import ReportFilter from '../components/Reportfilter';
import ResultsTable from '../components/ResultsTable';
import PriceHistoryResults from '../components/PriceHistoryResults';
import Pagination from '../components/Pagination';
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

  const renderResults = () => {
    if (loading) {
      return <p>Carregando...</p>;
    }
    
    if (results.length === 0) {
      return <p>Nenhum resultado encontrado.</p>;
    }

    return filters.priceType === 'current' ? (
      <ResultsTable results={results} />
    ) : (
      <PriceHistoryResults results={results} />
    );
  };

  const renderPagination = () => {
    return (
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
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
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  };

  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(',') + '\n';
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    return header + csv;
  };

  return (
    <div>
      <div className="flex space-x-4 mt-4">
        <button onClick={exportToExcel} className="ml-5 px-4 py-2 bg-green-600 text-white rounded-md">
          Exportar para Excel
        </button>
        <button onClick={exportToCSV} className="px-4 py-2 bg-yellow-600 text-white rounded-md">
          Exportar para CSV
        </button>
      </div>
      <ReportFilter onGenerateReport={handleGenerateReport} />
      {renderResults()}
      {results.length > 0 && renderPagination()}
    </div>
  );
};

export default Relatorios;
