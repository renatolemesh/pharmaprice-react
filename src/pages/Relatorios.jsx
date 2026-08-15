import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import ReportFilter from "../components/Reportfilter";
import ResultsTable from "../components/ResultsTable";
import PriceHistoryResults from "../components/PriceHistoryResults";
import Pagination from "../components/Pagination";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/feedback";
import { exportReportData, fetchReportData } from "../services/api";
import { useApiQuery, useRetry } from "../hooks/useApiQuery";

const baixarBlob = (blob, nomeArquivo) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const Relatorios = () => {
  const [filtros, setFiltros] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [exportando, setExportando] = useState(null);
  const [erroExport, setErroExport] = useState(null);
  const [nonce, tentarDeNovo] = useRetry();

  const { data, error, carregando, inativa } = useApiQuery(
    fetchReportData,
    filtros ? [filtros, pagina] : null,
    nonce,
  );

  const gerar = (novosFiltros) => {
    setFiltros(novosFiltros);
    setPagina(1);
    setErroExport(null);
  };

  const exportar = async (formato) => {
    setExportando(formato);
    setErroExport(null);
    try {
      const blob = await exportReportData(filtros, formato);
      baixarBlob(blob, formato === "excel" ? "relatorio.xlsx" : "relatorio.csv");
    } catch (err) {
      setErroExport(`Não foi possível exportar: ${err.message}`);
    } finally {
      setExportando(null);
    }
  };

  const linhas = data?.data ?? [];

  const botaoExport =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Extração por farmácia e período. A exportação é feita pelo servidor — o arquivo já vem pronto."
        actions={
          linhas.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => exportar("excel")}
                disabled={Boolean(exportando)}
                className={botaoExport}
              >
                {exportando === "excel" ? (
                  <Download className="h-4 w-4 animate-bounce" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-dashboard-success" />
                )}
                Excel
              </button>
              <button
                type="button"
                onClick={() => exportar("csv")}
                disabled={Boolean(exportando)}
                className={botaoExport}
              >
                {exportando === "csv" ? (
                  <Download className="h-4 w-4 animate-bounce" />
                ) : (
                  <FileText className="h-4 w-4 text-dashboard-warning" />
                )}
                CSV
              </button>
            </>
          )
        }
      />

      <ReportFilter onGenerateReport={gerar} carregando={carregando} />

      {erroExport && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {erroExport}
        </p>
      )}

      {inativa && (
        <EmptyState
          icon={FileText}
          title="Configure o relatório"
          description="Escolha as farmácias e o tipo de preço. Sem farmácia selecionada, o relatório cobre todas."
        />
      )}

      {carregando && <TableSkeleton />}

      {error && <ErrorState message={error} onRetry={tentarDeNovo} />}

      {data && (
        <>
          {filtros.priceType === "current" ? (
            <ResultsTable results={linhas} />
          ) : (
            <PriceHistoryResults results={linhas} />
          )}
          <Pagination
            currentPage={data.current_page ?? pagina}
            totalPages={data.last_page ?? 1}
            total={data.total}
            onPageChange={setPagina}
          />
        </>
      )}
    </>
  );
};

export default Relatorios;
