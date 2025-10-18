import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { fetchStatistics } from '../../services/Api';  

const statisticsDataGross = await fetchStatistics();
let statisticsData = statisticsDataGross.data ?? null;
let chartData = [];
if (statisticsData) {
  chartData.push({ name: 'Aumentos', value: parseInt(statisticsData.price_increases) ?? 0, color: 'hsl(var(--dashboard-danger))' });
  chartData.push({ name: 'Reduções', value: parseInt(statisticsData.price_decreases) ?? 0, color: 'hsl(var(--dashboard-success))' });
}

export const DonutChart = () => {
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value.toLocaleString()} produtos ({((item.value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Produtos com Aumento de Preço vs. Redução de Preço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 flex justify-center space-x-8">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">
                {item.name} ({item.value.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
