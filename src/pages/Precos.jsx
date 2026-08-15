import { useState } from "react";
import { Search } from "lucide-react";
import SearchBar from "../components/SearchBar";
import ResultsTable from "../components/ResultsTable";
import Pagination from "../components/Pagination";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/feedback";
import { fetchPrecos } from "../services/api";
import { useApiQuery, useRetry } from "../hooks/useApiQuery";

const Precos = () => {
  const [filtros, setFiltros] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [nonce, tentarDeNovo] = useRetry();

  const { data, error, carregando, inativa } = useApiQuery(
    fetchPrecos,
    filtros?.query ? [filtros, pagina] : null,
    nonce,
  );

  const buscar = (query, searchType) => {
    setFiltros({ query, searchType });
    setPagina(1);
  };

  const trocarPagina = (novaPagina) => {
    setPagina(novaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHeader
        title="Comparar Preços"
        description="Preço mais recente de cada farmácia para o produto, do mais barato ao mais caro."
      />

      <div className="mb-6">
        <SearchBar onSearch={buscar} autoFocus />
      </div>

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
