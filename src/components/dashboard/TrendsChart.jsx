import PropTypes from "prop-types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDashboard } from "../../contexts/dashboard";
import { formatDate } from "../../utils/format";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-hover">
      <p className="mb-2 text-xs text-muted-foreground">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="tabular font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
};

export const TrendsChart = () => {
  const { trends } = useDashboard();

  // O eixo guarda a data ISO e formata na hora de desenhar. O codigo antigo
  // rotulava so o dia da semana ("seg", "ter"), o que fica ambiguo assim que a
  // janela passa de sete dias.
  const chartData = (trends ?? []).map(({ date, increases, decreases }) => ({
    date,
    increases: Number(increases) || 0,
    decreases: Number(decreases) || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimento de preços</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Nenhum dado no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="gradAumentos" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--dashboard-danger))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--dashboard-danger))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="gradReducoes" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--dashboard-success))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--dashboard-success))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(v).slice(0, 5)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="increases"
                  stroke="hsl(var(--dashboard-danger))"
                  fill="url(#gradAumentos)"
                  strokeWidth={2}
                  name="Aumentos"
                />
                <Area
                  type="monotone"
                  dataKey="decreases"
                  stroke="hsl(var(--dashboard-success))"
                  fill="url(#gradReducoes)"
                  strokeWidth={2}
                  name="Reduções"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
