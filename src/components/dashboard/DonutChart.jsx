import PropTypes from "prop-types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDashboard } from "../../contexts/dashboard";
import { formatNumberToBRL } from "../../utils/format";

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const fatia = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-hover">
      <p className="font-medium">{item.name}</p>
      <p className="tabular text-sm text-muted-foreground">
        {formatNumberToBRL(item.value)} produtos ({fatia}%)
      </p>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  total: PropTypes.number,
};

export const DonutChart = () => {
  const { statistics } = useDashboard();

  const chartData = [
    {
      name: "Aumentos",
      value: Number(statistics.price_increases) || 0,
      color: "hsl(var(--dashboard-danger))",
    },
    {
      name: "Reduções",
      value: Number(statistics.price_decreases) || 0,
      color: "hsl(var(--dashboard-success))",
    },
  ];

  const total = chartData.reduce((soma, item) => soma + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aumentos x reduções de preço</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Nenhum dado no período
          </div>
        ) : (
          <>
            <div className="relative h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip total={total} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Total no miolo: o donut sozinho mostra proporcao, nao volume. */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="tabular text-2xl font-bold">
                  {formatNumberToBRL(total)}
                </span>
                <span className="text-xs text-muted-foreground">mudanças</span>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-6">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="tabular font-semibold">
                    {formatNumberToBRL(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
