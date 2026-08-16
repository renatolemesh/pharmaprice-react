import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import SearchBar from "../components/SearchBar";
import ResultsTable from "../components/ResultsTable";
import Pagination from "../components/Pagination";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/feedback";
import { baixarBlob, exportReportData, fetchPrecos } from "../services/api";
import { useApiQuery, useRetry } from "../hooks/useApiQuery";

const Precos = () => {
  /*
   * A busca mora na URL, nao no estado do componente. Sem isso o resultado nao
   * podia ser compartilhado nem salvo nos favoritos, e o botao voltar do
   * navegador saia da tela em vez de desfazer a busca.
   */
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const searchType = params.get("tipo") === "ean" ? "ean" : "descricao";
  const pagina = Number(params.get("pagina")) || 1;

  const [exportando, setExportando] = useState(null);
  const [erroExport, setErroExport] = useState(null);
  const [nonce, tentarDeNovo] = useRetry();

  const { data, error, carregando, inativa } = useApiQuery(
    fetchPrecos,
    query ? [{ query, searchType }, pagina] : null,
    nonce,
  );

  const buscar = (novaQuery, novoTipo) => {
    setParams({ q: novaQuery, tipo: novoTipo });
    setErroExport(null);
  };

  const trocarPagina = (novaPagina) => {
    setParams({ q: query, tipo: searchType, pagina: String(novaPagina) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportar = async (formato) => {
    setExportando(formato);
    setErroExport(null);
    try {
      const blob = await exportReportData(
        { priceType: "current", query, searchType },
        formato,
      );
      const base = query.replace(/[^\w-]+/g, "-").slice(0, 40) || "busca";
      baixarBlob(blob, `${base}.${formato === "excel" ? "xlsx" : "csv"}`);
    } catch (err) {
      setErroExport(`Não foi possível exportar: ${err.message}`);
    } finally {
      setExportando(null);
    }
  };

  const temResultado = (data?.data ?? []).length > 0;

  const botaoExport =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-smooth hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <PageHeader
        title="Comparar Preços"
        description="Preço mais recente de cada farmácia para o produto, do mais barato ao mais caro."
        actions={
          temResultado && (
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

      <div className="mb-6">
        <SearchBar onSearch={buscar} valorInicial={query} autoFocus={!query} />
      </div>

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
          icon={Search}
          title="Busque um produto para comparar"
          description="Digite a descrição (ex.: dipirona 500mg) ou cole o código de barras. A comparação usa o EAN — produtos de redes diferentes com o mesmo código aparecem lado a lado."
        />
      )}

      {carregando && <TableSkeleton />}

      {error && <ErrorState message={error} onRetry={tentarDeNovo} />}

      {data && (
        <>
          <ResultsTable results={data.data ?? []} />
          <Pagination
            currentPage={data.current_page ?? pagina}
            totalPages={data.last_page ?? 1}
            total={data.total}
            onPageChange={trocarPagina}
          />
        </>
      )}
    </>
  );
};

export default Precos;
