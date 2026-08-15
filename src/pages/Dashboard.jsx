import {
  Clock,
  Database,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "../contexts/dashboard";
import DashboardProvider from "../contexts/DashboardProvider";
import { MetricCard } from "../components/dashboard/MetricCard";
import { DonutChart } from "../components/dashboard/DonutChart";
import { TopProductsTable } from "../components/dashboard/TopProductsTable";
import { TrendsChart } from "../components/dashboard/TrendsChart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import PageHeader from "../components/ui/PageHeader";
import { ErrorState } from "../components/ui/feedback";
import { formatNumberToBRL } from "../utils/format";

const CardEsqueleto = () => (
  <div className="skeleton h-[132px] rounded-card" />
);

const DashboardContent = () => {
  const { statistics, pharmacyStats, topProducts, loading, error, refresh } =
    useDashboard();

  if (error) {
    return (
      <>
        <PageHeader title="Painel de Análises" />
        <ErrorState message={error} onRetry={refresh} />
      </>
    );
  }

  const maiorQueda = topProducts.top_prices_decrease?.[0]?.variation_percent;
  const maiorAumento = topProducts.top_prices_increase?.[0]?.variation_percent;
  const lider = pharmacyStats[0];

  return (
    <>
      <PageHeader
        title="Painel de Análises"
        description="Visão geral dos preços e das tendências das farmácias monitoradas."
        actions={
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <CardEsqueleto key={i} />)
          : [
              <MetricCard
                key="atualizados"
                title="Atualizados na semana"
                value={formatNumberToBRL(statistics.updated_products || 0)}
                change={statistics.updated_products_change}
                icon={<RefreshCw className="h-5 w-5 text-dashboard-primary" />}
              />,
              <MetricCard
                key="variacao"
                title="Variação média"
                value={statistics.average_variation ?? 0}
                suffix="%"
                change={statistics.average_variation_change}
                inverso
                icon={<TrendingUp className="h-5 w-5 text-dashboard-warning" />}
              />,
              <MetricCard
                key="aumentos"
                title="Aumentos de preço"
                value={formatNumberToBRL(statistics.price_increases || 0)}
                change={statistics.price_increases_change}
                inverso
                icon={<TrendingUp className="h-5 w-5 text-dashboard-danger" />}
              />,
              <MetricCard
                key="reducoes"
                title="Reduções de preço"
                value={formatNumberToBRL(statistics.price_decreases || 0)}
                change={statistics.price_decreases_change}
                icon={<TrendingDown className="h-5 w-5 text-dashboard-success" />}
              />,
              <MetricCard
                key="tempo"
                title="Tempo médio p/ alteração"
                value={statistics.average_change_time ?? 0}
                suffix="dias"
                change={statistics.average_change_time_change}
                icon={<Clock className="h-5 w-5 text-dashboard-accent" />}
              />,
              <MetricCard
                key="total"
                title="Total de produtos"
                value={formatNumberToBRL(statistics.total_products || 0)}
                icon={<Package className="h-5 w-5 text-dashboard-secondary" />}
              />,
            ]}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TrendsChart />
        <DonutChart />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProductsTable />
        </div>

        <div className="space-y-4">
          <MetricCard
            title="Preços armazenados"
            value={formatNumberToBRL(statistics.total_prices_stored || 0)}
            icon={<Database className="h-5 w-5 text-dashboard-primary" />}
          />

          <Card>
            <CardHeader>
              <CardTitle>Resumo rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground">Farmácia mais ativa</span>
                <span className="text-right font-medium">
                  {lider?.pharmacy_name ?? "-"}
                  {lider && (
                    <span className="tabular block text-xs text-muted-foreground">
                      {formatNumberToBRL(lider.updated_products)} produtos
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Maior queda</span>
                <span className="tabular font-medium text-dashboard-success">
                  {maiorQueda != null ? `${maiorQueda}%` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Maior aumento</span>
                <span className="tabular font-medium text-dashboard-danger">
                  {maiorAumento != null ? `${maiorAumento}%` : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const Dashboard = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);

export default Dashboard;
