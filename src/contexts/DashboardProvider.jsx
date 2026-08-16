import { useMemo } from "react";
import PropTypes from "prop-types";
import { DashboardContext } from "./dashboard";
import { fetchDashboardSummary } from "../services/api";
import { useApiQuery, useRetry } from "../hooks/useApiQuery";

const SEM_ARGUMENTOS = [];

const DashboardProvider = ({ children }) => {
  const [nonce, refresh] = useRetry();

  /*
   * Uma chamada, nao quatro.
   *
   * A tela disparava statistics + trends + top-changes + pharmacy-stats em
   * paralelo na montagem. O /summary faz as quatro do lado do servidor e guarda
   * o resultado em cache por 5 min — troca quatro idas pela rede, e quatro
   * chances de falha parcial, por uma.
   */
  const { data, error, carregando } = useApiQuery(
    fetchDashboardSummary,
    SEM_ARGUMENTOS,
    nonce,
  );

  const value = useMemo(
    () => ({
      statistics: data?.statistics ?? {},
      pharmacyStats: data?.pharmacy_stats ?? [],
      topProducts: {
        top_prices_increase: data?.top_changes?.top_prices_increase ?? [],
        top_prices_decrease: data?.top_changes?.top_prices_decrease ?? [],
      },
      trends: data?.trends ?? [],
      loading: carregando,
      error,
      // `refresh` antes chamava uma `loadDashboardData` que so existia dentro do
      // efeito: qualquer clique no botao de atualizar estourava ReferenceError.
      refresh,
    }),
    [data, carregando, error, refresh],
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
};

DashboardProvider.propTypes = { children: PropTypes.node.isRequired };

export default DashboardProvider;
