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
  const [hasFetched, setHasFetched] = useState(false); // Novo estado para verificar se a consulta foi feita
  const [exporting, setExporting] = useState(false); // Novo estado para verificar se estamos exportando

  const handleGenerateReport = async (newFilters, page = 1) => {
    setLoading(true);
    setHasFetched(true); // Marca que a consulta foi realizada
    try {
      const data = await fetchReportData(newFilters, page);
      console.log(data.message)
      if (data.message == "Nenhum resultado encontrado.") {
        setResults([]); // Limpa os resultados e exibe a mensagem
      } else {
        setResults(data.data);
        setCurrentPage(data.current_page);
        setTotalPages(data.last_page);
      }
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
      return (
        <div className="flex items-center justify-center h-screen">
          <img src="public/gifs/rolling.svg" alt="Carregando..." className="w-35 h-auto" />
        </div>
      );
    }

    if (results.length === 0 && hasFetched) {
      return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-gray-600">Nenhum resultado encontrado.</p>
        </div>
      );
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
    setExporting(true); // Marca que a exportação está em andamento
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
    } finally {
      setExporting(false); // Finaliza a exportação
    }
  };

  const exportToCSV = async () => {
    setExporting(true); // Marca que a exportação está em andamento
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
    } finally {
      setExporting(false); // Finaliza a exportação
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
      {/* Botões de exportação acima do filtro */}
      <ReportFilter onGenerateReport={handleGenerateReport} />
      
      {results.length > 0 && (
        <div className="flex justify-end mt-4 space-x-4 mr-5">
          <button 
            onClick={exportToExcel} 
            className="px-4 py-2 bg-green-600 text-white rounded-md"
            disabled={exporting} // Desabilita o botão durante a exportação
          >
            Exportar para Excel
          </button>
          <button 
            onClick={exportToCSV} 
            className="px-4 py-2 bg-yellow-600 text-white rounded-md"
            disabled={exporting} // Desabilita o botão durante a exportação
          >
            Exportar para CSV
          </button>
        </div>
      )}

      {/* Gif de carregamento (só exibe se exportando) */}
      {exporting && (
        <div className="absolute top-4 right-4">
          <img src="public/gifs/rolling.svg" alt="Carregando..." className="w-10 h-auto" />
        </div>
      )}

      {renderResults()}
      {results.length > 0 && renderPagination()}
    </div>
  );
};

export default Relatorios;
