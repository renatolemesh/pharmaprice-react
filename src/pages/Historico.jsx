import { useState } from "react";
import { History } from "lucide-react";
import PriceHistoryFilter from "../components/PriceHistoryFilter";
import PriceHistoryResults from "../components/PriceHistoryResults";
import Pagination from "../components/Pagination";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/feedback";
import { fetchPriceHistory } from "../services/api";
import { useApiQuery, useRetry } from "../hooks/useApiQuery";

const Historico = () => {
  const [filtros, setFiltros] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [nonce, tentarDeNovo] = useRetry();

  const { data, error, carregando, inativa } = useApiQuery(
    fetchPriceHistory,
    filtros ? [filtros, pagina] : null,
    nonce,
  );

  const buscar = (novosFiltros) => {
    setFiltros(novosFiltros);
    setPagina(1);
  };

  return (
    <>
      <PageHeader
        title="Histórico de Preços"
        description="Cada linha é uma mudança de preço — preço estável não gera registro."
      />

      <PriceHistoryFilter onSearch={buscar} carregando={carregando} />

      {inativa && (
        <EmptyState
          icon={History}
          title="Escolha um filtro para ver o histórico"
          description="Busque por produto, por farmácia, por período — ou combine os três."
        />
      )}

      {carregando && <TableSkeleton rows={5} />}

      {error && <ErrorState message={error} onRetry={tentarDeNovo} />}

      {data && (
        <>
          <PriceHistoryResults results={data.data ?? []} />
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

export default Historico;
