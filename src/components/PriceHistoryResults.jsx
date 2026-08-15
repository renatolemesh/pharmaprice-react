import { useId, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format";
import { useIsMobile } from "../hooks/useMediaQuery";
import { EmptyState } from "./ui/feedback";
import EanCopiavel from "./ui/EanCopiavel";

/** "2026-07-03" -> "03/07". Ano inteiro no eixo nao cabe em tela de celular. */
const diaMes = (valor) => formatDate(valor).slice(0, 5);

/** "2026-07-03" -> "03/07/26" */
const dataCurta = (valor) => {
  const d = formatDate(valor);
  return `${d.slice(0, 6)}${d.slice(8, 10)}`;
};

/** "2026-07-03" -> "07/26" */
const mesAno = (valor) => {
  const d = formatDate(valor);
  return `${d.slice(3, 5)}/${d.slice(8, 10)}`;
};

/** 8.49 -> "8,49". Sem o "R$" o eixo Y devolve uns 20px pro gráfico. */
const soNumero = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  const isMobile = useIsMobile();
  // O id do gradiente e global no documento: varios grupos abertos ao mesmo
  // tempo com o mesmo id fariam todos apontar pro <defs> do primeiro.
  const gradId = useId();

  const { serie, ultimo, minimo, maximo, variacao, multiAno } = useMemo(() => {
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
      // Serie que atravessa a virada do ano nao pode ter rotulo so com dia/mes:
      // "22/06 · 08/05 · 09/06" parece fora de ordem quando sao anos
      // diferentes, e a serie esta ordenada certinho.
      multiAno:
        new Set(pontos.map((p) => String(p.data).slice(0, 4))).size > 1,
    };
  }, [grupo]);

  /*
   * Serie longa muda o desenho: com 72 mudancas de preco, uma bolinha por ponto
   * cobre a propria linha e o grafico vira uma nuvem. Acima de ~24 pontos os
   * marcadores saem e o traco afina — a leitura passa a ser a forma da curva,
   * e o valor exato continua na tabela logo abaixo.
   */
  const serieLonga = serie.length > 24;

  const rotuloEixoX = multiAno
    ? isMobile
      ? mesAno
      : dataCurta
    : isMobile
      ? diaMes
      : formatDate;

  const subiu = variacao > 0.5;
  const caiu = variacao < -0.5;
  const Icone = subiu ? TrendingUp : caiu ? TrendingDown : Minus;
  const corVariacao = subiu
    ? "text-dashboard-danger"
    : caiu
      ? "text-dashboard-success"
      : "text-muted-foreground";

  const alternar = () => setAberto((v) => !v);

  return (
    <article className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      {/*
        O cabecalho nao e um <button> unico: o EAN copiavel tambem e um botao, e
        botao dentro de botao e HTML invalido — o navegador desmonta o aninhado
        e o clique de copiar acabaria expandindo o grupo.
      */}
      <div className="flex items-center gap-2 p-3 sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-dashboard-primary/10 px-2 py-0.5 text-xs font-medium text-dashboard-primary">
              {grupo.nome_farmacia}
            </span>
            <EanCopiavel ean={grupo.EAN} className="text-xs" />
          </div>

          <button
            type="button"
            onClick={alternar}
            aria-expanded={aberto}
            className="block w-full text-left"
          >
            {/* Duas linhas no celular em vez de truncar: com ~200px de largura
                util, "Dipirona Sodica 500mg 20…" cortava justo na parte que
                distingue uma apresentacao da outra. */}
            <p
              className="line-clamp-2 text-sm font-medium sm:truncate"
              title={grupo.descricao}
            >
              {grupo.descricao}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {serie.length} {serie.length === 1 ? "mudança" : "mudanças"}
              {minimo !== null && (
                <>
                  {" · "}
                  {formatCurrency(minimo)} – {formatCurrency(maximo)}
                </>
              )}
            </p>
          </button>
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

        <button
          type="button"
          onClick={alternar}
          aria-expanded={aberto}
          aria-label={aberto ? "Recolher histórico" : "Expandir histórico"}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
        >
          <ChevronDown
            className={`h-5 w-5 transition-smooth ${aberto ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {aberto && (
        <div className="border-t border-border p-3 sm:p-4">
          {serie.length > 1 && (
            /*
             * No celular o gráfico sangra até a borda do cartão (`-mx-3`) e
             * fica bem mais alto. Espremido entre os paddings sobravam ~290px
             * de largura, e uma série de 3 pontos virava um risquinho no meio
             * de espaço vazio.
             */
            <div className="-ml-3 mb-4 h-72 sm:ml-0 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                {/* Margem direita generosa: o ultimo rotulo do eixo X e
                    centralizado no ponto final, entao metade dele fica pra
                    fora e o cartao (overflow-hidden) corta — virava "10/2". */}
                <AreaChart
                  data={serie}
                  margin={{ top: 12, right: 24, bottom: 4, left: 4 }}
                >
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--dashboard-primary))"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--dashboard-primary))"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="data"
                    // No celular o rotulo encolhe: a data inteira ocupa o dobro
                    // e o Recharts acaba escondendo quase todos pra evitar
                    // sobreposicao. O ano so entra quando a serie atravessa a
                    // virada dele — sem isso a ordem parece errada.
                    tickFormatter={rotuloEixoX}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={isMobile ? 28 : 40}
                    interval="preserveStartEnd"
                    padding={{ left: 8, right: 8 }}
                  />
                  <YAxis
                    domain={["dataMin - 0.5", "dataMax + 0.5"]}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 38 : 60}
                    tickCount={isMobile ? 3 : 4}
                    tickFormatter={isMobile ? soNumero : formatCurrency}
                  />
                  <Tooltip content={<DicaGrafico />} />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="hsl(var(--dashboard-primary))"
                    strokeWidth={serieLonga ? 2 : 3}
                    fill={`url(#${gradId})`}
                    dot={
                      serieLonga
                        ? false
                        : {
                            r: isMobile ? 5 : 4,
                            fill: "hsl(var(--card))",
                            stroke: "hsl(var(--dashboard-primary))",
                            strokeWidth: 2.5,
                          }
                    }
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/*
                Curva suave (`monotone`). Vale lembrar ao ler: `precos` so ganha
                linha quando o valor muda, entao entre dois pontos o preco ficou
                parado — a inclinacao entre eles e desenho, nao dado. Os pontos
                marcam onde houve mudanca de fato, e a tabela abaixo traz as
                datas exatas.
              */}
            </div>
          )}

          {/*
            Rolagem propria acima de ~24 mudancas: 72 linhas soltas faziam o
            cartao passar de 3.000px de altura, e chegar no proximo produto
            virava uma viagem.
          */}
          <div
            className={`overflow-x-auto ${
              serieLonga ? "max-h-80 overflow-y-auto" : ""
            }`}
          >
            <table className="w-full text-sm">
              <thead className={serieLonga ? "sticky top-0 bg-card" : ""}>
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
