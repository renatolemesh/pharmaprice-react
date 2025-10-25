import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { DonutChart } from '../components/dashboard/DonutChart';
import { TopProductsTable } from '../components/dashboard/TopProductsTable';
import { TrendsChart } from '../components/dashboard/TrendsChart';
import { formatNumberToBRL } from '../utils/helper.js';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Database,
  RefreshCw 
} from 'lucide-react';

const DashboardContent = () => {
  const { statistics, pharmacyStats, topProducts, loading } = useDashboard();

  const topDecrease = topProducts.top_prices_decrease?.[0]?.variation_percent || '-';
  const topIncrease = topProducts.top_prices_increase?.[0]?.variation_percent || '-';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-dashboard-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Carregando dados do painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dashboard-primary via-dashboard-secondary to-dashboard-accent bg-clip-text text-transparent mb-2">
            Painel de Análises
          </h1>
          <p className="text-muted-foreground font-medium mt-5 text-lg font-semibold">
            Visão abrangente dos dados de preços e tendências das farmácias
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <MetricCard
            title="Produtos Atualizados na Última Semana"
            value={formatNumberToBRL(statistics.updated_products || 0)}
            change={statistics.updated_products_change}
            changeType={statistics.updated_products_change >= 0 ? 'increase' : 'decrease'}
            trend={statistics.updated_products_change >= 0 ? 'up' : 'down'}
            icon={<RefreshCw className="w-6 h-6 text-dashboard-primary" />}
          />
          
          <MetricCard
            title="Variação Média de Preços"
            value={(statistics.average_variation || 0) + '%'}
            change={statistics.average_variation_change}
            changeType={statistics.average_variation_change >= 0 ? 'increase' : 'decrease'}
            trend={statistics.average_variation_change >= 0 ? 'up' : 'down'}
            icon={<TrendingDown className="w-6 h-6 text-dashboard-danger" />}
          />
          
          <MetricCard
            title="Aumentos de Preço"
            value={formatNumberToBRL(statistics.price_increases || 0)}
            change={statistics.price_increases_change}
            changeType={statistics.price_increases_change >= 0 ? 'increase' : 'decrease'}
            trend={statistics.price_increases_change >= 0 ? 'up' : 'down'}
            icon={<TrendingUp className="w-6 h-6 text-dashboard-success" />}
          />
          
          <MetricCard
            title="Reduções de Preço"
            value={formatNumberToBRL(statistics.price_decreases || 0)}
            change={statistics.price_decreases_change}
            changeType={statistics.price_decreases_change >= 0 ? 'increase' : 'decrease'}
            trend={statistics.price_decreases_change >= 0 ? 'up' : 'down'}
            icon={<TrendingDown className="w-6 h-6 text-dashboard-danger" />}
          />
          
          <MetricCard
            title="Tempo Médio para Alteração"
            value={(statistics.average_change_time || 0) + ' dias'}
            change={statistics.average_change_time_change}
            changeType={statistics.average_change_time_change >= 0 ? 'increase' : 'decrease'}
            trend={statistics.average_change_time_change >= 0 ? 'up' : 'down'}
            icon={<Clock className="w-6 h-6 text-dashboard-accent" />}
          />

          <MetricCard
            title="Total de Produtos"
            value={formatNumberToBRL(statistics.total_products || 0)}
            change={null}
            icon={<Package className="w-6 h-6 text-dashboard-secondary" />}
            showPercentage={false}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <TrendsChart />
          <DonutChart />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TopProductsTable />
          </div>
          
          <div className="space-y-6">
            <MetricCard
              title="Total de Preços Armazenados"
              value={formatNumberToBRL(statistics.total_prices_stored || 0)}
              change={null}
              showPercentage={false}
              icon={<Database className="w-6 h-6 text-dashboard-primary" />}
            />
            
            <div className="bg-gradient-to-br from-dashboard-primary/5 to-dashboard-secondary/5 rounded-xl p-6 border border-dashboard-primary/10">
              <h3 className="font-semibold mb-3 text-dashboard-primary">Estatísticas Rápidas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farmácia Mais Atualizada:</span>
                  <span className="font-medium">
                    {pharmacyStats[0]?.pharmacy_name ?? '-'} 
                    {pharmacyStats[0] && ' (' + formatNumberToBRL(pharmacyStats[0].updated_products) + ')'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maior Queda de Preço:</span>
                  <span className="font-medium text-dashboard-success">{topDecrease}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maior Aumento de Preço:</span>
                  <span className="font-medium text-dashboard-danger">{topIncrease}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);

export default Dashboard;