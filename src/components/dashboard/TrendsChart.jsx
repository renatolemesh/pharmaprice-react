import PropTypes from 'prop-types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useDashboard } from '../../contexts/DashboardContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} produtos
          </p>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
};

export const TrendsChart = () => {
  const { trends } = useDashboard();

  const chartData = trends.map(({ date, increases, decreases }) => ({
    day: new Date(date).toLocaleString('pt-BR', { weekday: 'short' }),
    date,
    increases,
    decreases
  }));

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Tendências de Movimento de Preços (última semana)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="increasesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--dashboard-danger))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--dashboard-danger))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="decreasesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--dashboard-success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--dashboard-success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="increases"
                  stroke="hsl(var(--dashboard-danger))"
                  fillOpacity={1}
                  fill="url(#increasesGradient)"
                  strokeWidth={2}
                  name="Preços Aumentados"
                />
                <Area
                  type="monotone"
                  dataKey="decreases"
                  stroke="hsl(var(--dashboard-success))"
                  fillOpacity={1}
                  fill="url(#decreasesGradient)"
                  strokeWidth={2}
                  name="Preços Reduzidos"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};