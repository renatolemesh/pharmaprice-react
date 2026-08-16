import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatDate } from "../utils/format";
import { corDaFarmacia } from "../utils/paletaFarmacias";
import { useIsMobile } from "../hooks/useMediaQuery";

const numero = (valor) => {
  const n = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
};

const paraTimestamp = (iso) => {
  const [ano, mes, dia] = String(iso).split(/[ T]/)[0].split("-").map(Number);
  return ano && mes && dia ? new Date(ano, mes - 1, dia).getTime() : Number.NaN;
};

/**
 * Une as séries de várias farmácias num eixo de tempo só.
 *
 * O ponto delicado é o "carry-forward": `precos` só ganha linha quando o valor
 * muda, então numa data em que a Panvel mexeu no preço e a Raia não, a Raia não
 * está ausente — ela está no último preço dela. Sem carregar o valor anterior
 * pra frente, cada série viraria pontilhado e a comparação some justamente nas
 * datas em que uma rede mexeu e a outra não.
 *
 * Antes do primeiro preço de uma rede o valor é null de verdade (ela não era
 * monitorada ainda), e a linha não começa ali.
 */
const unirSeries = (grupos) => {
  const series = grupos.map((g) => ({
    nome: g.nome_farmacia,
    pontos: [...(g.precos ?? [])]
      .map((p) => ({ ts: paraTimestamp(p.data), valor: numero(p.preco) }))
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.valor))
      .sort((a, b) => a.ts - b.ts),
  }));

  const datas = [
    ...new Set(series.flatMap((s) => s.pontos.map((p) => p.ts))),
  ].sort((a, b) => a - b);

  const cursores = series.map(() => ({ i: 0, ultimo: null }));

  return datas.map((ts) => {
    const linha = { ts };
    series.forEach((serie, idx) => {
      const cursor = cursores[idx];
      while (cursor.i < serie.pontos.length && serie.pontos[cursor.i].ts <= ts) {
        cursor.ultimo = serie.pontos[cursor.i].valor;
        cursor.i += 1;
      }
      linha[serie.nome] = cursor.ultimo;
    });
    return linha;
  });
};

const Dica = ({ active, payload, label, mapaIds }) => {
  if (!active || !payload?.length) return null;

  const validos = payload
    .filter((p) => p.value != null)
    .sort((a, b) => a.value - b.value);

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-hover">
      <p className="mb-2 text-xs text-muted-foreground">{formatDate(new Date(label).toISOString())}</p>
      <ul className="space-y-1">
        {validos.map((p, i) => (
          <li key={p.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: corDaFarmacia(mapaIds[p.name]) }}
            />
            <span className="flex-1 text-muted-foreground">{p.name}</span>
            <span
              className={`tabular font-semibold ${
                i === 0 ? "text-dashboard-success" : ""
              }`}
            >
              {formatCurrency(p.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

Dica.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  mapaIds: PropTypes.object,
};

const ComparativoHistorico = ({ grupos = [], mapaIds = {} }) => {
  const isMobile = useIsMobile();

  const { dados, nomes } = useMemo(
    () => ({
      dados: unirSeries(grupos),
      nomes: grupos.map((g) => g.nome_farmacia),
    }),
    [grupos],
  );

  if (dados.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Ainda não há mudanças de preço suficientes para desenhar a comparação.
      </p>
    );
  }

  const rotuloData = (ts) => {
    const d = formatDate(new Date(ts).toISOString());
    return isMobile ? `${d.slice(3, 5)}/${d.slice(8, 10)}` : d.slice(0, 5);
  };

  return (
    <div className="-ml-3 h-80 sm:ml-0 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 12, right: 24, bottom: 4, left: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          {/* Eixo de tempo numerico, nao categorico: mudancas de preco caem em
              datas irregulares, e um eixo de categorias espacaria igualmente
              dois dias e dois meses. */}
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={rotuloData}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            minTickGap={isMobile ? 28 : 48}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={isMobile ? 44 : 66}
            tickCount={isMobile ? 4 : 6}
            tickFormatter={(v) =>
              isMobile ? Number(v).toFixed(0) : formatCurrency(v)
            }
          />
          <Tooltip content={<Dica mapaIds={mapaIds} />} />
          <Legend
            iconType="plainline"
            iconSize={16}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
          {nomes.map((nome) => (
            <Line
              key={nome}
              type="stepAfter"
              dataKey={nome}
              name={nome}
              stroke={corDaFarmacia(mapaIds[nome])}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              // Degrau, e nao curva: aqui o valor carregado pra frente entre
              // duas mudancas e literalmente o preco que vigorou no periodo.
              // Uma curva desenharia uma transicao que nao houve.
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

ComparativoHistorico.propTypes = {
  grupos: PropTypes.arrayOf(PropTypes.object),
  mapaIds: PropTypes.object,
};

export default ComparativoHistorico;
