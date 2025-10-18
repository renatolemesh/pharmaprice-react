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

import { fetchStatistics, fetchPharmacyStats, fetchTopProductsChanges } from '../services/Api';  

const { data: statisticsData = [] } = await fetchStatistics() ?? {};
const { data: pharmacyStatsData = [] } = await fetchPharmacyStats() ?? {};
const  topProducts = await fetchTopProductsChanges() ?? {};
let topDecrease = '-';
let topIncrease = '-';

if(topProducts['top_prices_decrease'] && topProducts['top_prices_decrease'][0]){
  topDecrease = topProducts['top_prices_decrease'][0].variation_percent;
}
if(topProducts['top_prices_increase'] && topProducts['top_prices_increase'][0]){
  topIncrease = topProducts['top_prices_increase'][0].variation_percent;
}


const Dashboard = () => (
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
            value={formatNumberToBRL(statisticsData.updated_products)}
            change={statisticsData.updated_products_change}
            changeType={statisticsData.updated_products_change >= 0 ? 'increase' : 'decrease'}
            trend={statisticsData.updated_products_change >= 0 ? 'up' : 'down'}
            icon={<RefreshCw className="w-6 h-6 text-dashboard-primary" />}
          />
          
          <MetricCard
            title="Variação Média de Preços"
            value={statisticsData.average_variation+'%'}
            change={statisticsData.average_variation_change}
            changeType={statisticsData.average_variation_change >= 0 ? 'increase' : 'decrease'}
            trend={statisticsData.average_variation_change >= 0 ? 'up' : 'down'}
            icon={<TrendingDown className="w-6 h-6 text-dashboard-danger" />}
          />
          
          <MetricCard
            title="Aumentos de Preço"
            value={formatNumberToBRL(statisticsData.price_increases)}
            change={statisticsData.price_increases_change}
            changeType={statisticsData.price_increases_change >= 0 ? 'increase' : 'decrease'}
            trend={statisticsData.price_increases_change >= 0 ? 'up' : 'down'}
            icon={<TrendingUp className="w-6 h-6 text-dashboard-success" />}
          />
          
          <MetricCard
            title="Reduções de Preço"
            value={formatNumberToBRL(statisticsData.price_decreases)}
            change={statisticsData.price_decreases_change}
            changeType={statisticsData.price_decreases_change >= 0 ? 'increase' : 'decrease'}
            trend={statisticsData.price_decreases_change >= 0 ? 'up' : 'down'}
            icon={<TrendingDown className="w-6 h-6 text-dashboard-danger" />}
          />
          
          <MetricCard
            title="Tempo Médio para Alteração"
            value={statisticsData.average_change_time+' dias'}
            change={statisticsData.average_change_time_change}
            changeType={statisticsData.average_change_time_change >= 0 ? 'increase' : 'decrease'}
            trend={statisticsData.average_change_time_change >= 0 ? 'up' : 'down'}
            icon={<Clock className="w-6 h-6 text-dashboard-accent" />}
          />

          <MetricCard
            title="Total de Produtos"
            value={formatNumberToBRL(statisticsData.total_products)}
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
              value={formatNumberToBRL(statisticsData.total_prices_stored)}
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
                    {pharmacyStatsData[0].pharmacy_name ?? '-'} 
                    {' (' + formatNumberToBRL(pharmacyStatsData[0].updated_products)  + ')'}
                    </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maior Queda de Preço:</span>
                  <span className="font-medium text-dashboard-success">{topDecrease + '%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maior Aumento de Preço:</span>
                  <span className="font-medium text-dashboard-danger">{topIncrease + '%'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

export default Dashboard;
