import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format";
import { EmptyState } from "./ui/feedback";

const numero = (valor) => {
  const n = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
};

const DicaGrafico = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const ponto = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-hover">
      <p className="text-xs text-muted-foreground">{formatDate(ponto.data)}</p>
      <p className="tabular font-semibold">{formatCurrency(ponto.preco)}</p>
    </div>
  );
};

DicaGrafico.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
};

const GrupoHistorico = ({ grupo }) => {
  const [aberto, setAberto] = useState(false);

  const { serie, ultimo, minimo, maximo, variacao } = useMemo(() => {
    const pontos = [...(grupo.precos ?? [])]
      .map((p) => ({ ...p, valor: numero(p.preco) }))
      .filter((p) => Number.isFinite(p.valor))
      .sort((a, b) => String(a.data).localeCompare(String(b.data)));

    const valores = pontos.map((p) => p.valor);
    const inicio = valores[0];
    const fim = valores[valores.length - 1];

    return {
      serie: pontos,
      ultimo: fim,
      minimo: valores.length ? Math.min(...valores) : null,
      maximo: valores.length ? Math.max(...valores) : null,
      variacao:
        Number.isFinite(inicio) && inicio > 0 && Number.isFinite(fim)
          ? ((fim / inicio - 1) * 100)
          : null,
    };
  }, [grupo]);

  const subiu = variacao > 0.5;
  const caiu = variacao < -0.5;
  const Icone = subiu ? TrendingUp : caiu ? TrendingDown : Minus;
  const corVariacao = subiu
    ? "text-dashboard-danger"
    : caiu
      ? "text-dashboard-success"
      : "text-muted-foreground";

  return (
    <article className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-4 p-4 text-left transition-smooth hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-dashboard-primary/10 px-2 py-0.5 text-xs font-medium text-dashboard-primary">
              {grupo.nome_farmacia}
            </span>
            <span className="tabular text-xs text-muted-foreground">
              {grupo.EAN}
            </span>
          </div>
          <p className="truncate text-sm font-medium" title={grupo.descricao}>
            {grupo.descricao}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {serie.length} {serie.length === 1 ? "mudança" : "mudanças"} de preço
            {minimo !== null && (
              <>
                {" · "}mín. {formatCurrency(minimo)} · máx. {formatCurrency(maximo)}
              </>
            )}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="tabular text-lg font-bold">{formatCurrency(ultimo)}</p>
          {variacao !== null && (
            <p
              className={`flex items-center justify-end gap-1 text-xs font-medium ${corVariacao}`}
            >
              <Icone className="h-3.5 w-3.5" />
              {variacao > 0 ? "+" : ""}
              {variacao.toFixed(1)}%
            </p>
          )}
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-smooth ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="border-t border-border p-4">
          {serie.length > 1 && (
            <div className="mb-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                  <XAxis
                    dataKey="data"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v) => formatCurrency(v)}
                  />
                  <Tooltip content={<DicaGrafico />} />
                  <Line
                    type="stepAfter"
                    dataKey="valor"
                    stroke="hsl(var(--dashboard-primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--dashboard-primary))" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/*
                `stepAfter` e nao `monotone` de proposito: `precos` so ganha
                linha quando o valor muda, entao entre dois registros o preco
                ficou parado. Uma curva suave desenharia uma variacao contínua
                que nunca existiu.
              */}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Data</th>
                  <th className="py-2 text-right font-medium">Preço</th>
                  <th className="py-2 text-right font-medium">Variação</th>
                </tr>
              </thead>
              <tbody>
                {[...serie].reverse().map((ponto, i, arr) => {
                  const anterior = arr[i + 1]?.valor;
                  const delta =
                    Number.isFinite(anterior) && anterior > 0
                      ? (ponto.valor / anterior - 1) * 100
                      : null;
                  return (
                    <tr
                      key={`${ponto.data}-${i}`}
                      className="border-b border-border/50 last:border-b-0"
                    >
                      <td className="py-2 text-muted-foreground">
                        {formatDate(ponto.data)}
                      </td>
                      <td className="tabular py-2 text-right font-medium">
                        {formatCurrency(ponto.valor)}
                      </td>
                      <td
                        className={`tabular py-2 text-right ${
                          delta === null
                            ? "text-muted-foreground"
                            : delta > 0
                              ? "text-dashboard-danger"
                              : "text-dashboard-success"
                        }`}
                      >
                        {delta === null
                          ? "—"
                          : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
};

GrupoHistorico.propTypes = { grupo: PropTypes.object.isRequired };

const PriceHistoryResults = ({ results = [] }) => {
  if (results.length === 0) {
    return (
      <EmptyState
        title="Nenhum histórico encontrado"
        description="Lembre-se: só é registrada a mudança de preço. Produto com preço estável no período não gera linha."
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((grupo, index) => (
        <GrupoHistorico
          key={`${grupo.EAN}-${grupo.nome_farmacia}-${index}`}
          grupo={grupo}
        />
      ))}
    </div>
  );
};

PriceHistoryResults.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object),
};

export default PriceHistoryResults;
