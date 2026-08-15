import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ArrowDown, ArrowUp, Check, Copy, ExternalLink } from "lucide-react";
import { montarUrl } from "../utils/url";
import { formatCurrency, formatRelativeDay } from "../utils/format";
import { useIsMobile } from "../hooks/useMediaQuery";
import { EmptyState } from "./ui/feedback";

const COLUNAS = [
  { key: "nome_farmacia", label: "Farmácia" },
  { key: "descricao", label: "Descrição" },
  { key: "EAN", label: "EAN" },
  { key: "preco", label: "Preço", align: "right" },
  { key: "ultima_coleta_em", label: "Atualizado", align: "right" },
];

const numero = (valor) => {
  const n = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
};

/**
 * Comparador que nunca estoura.
 *
 * O comparador antigo chamava `.toLowerCase()` e `.replace()` direto no valor
 * da celula — uma linha com descricao ou preco nulo derrubava a tabela inteira.
 * Nulo agora vai sempre pro fim, independente da direcao.
 */
const comparar = (a, b, coluna, direcao) => {
  const sinal = direcao === "asc" ? 1 : -1;
  let x = a[coluna];
  let y = b[coluna];

  if (x == null && y == null) return 0;
  if (x == null) return 1;
  if (y == null) return -1;

  if (coluna === "preco") {
    x = numero(x);
    y = numero(y);
  } else if (coluna === "data" || coluna === "ultima_coleta_em") {
    x = String(x);
    y = String(y); // ISO ordena igual como texto
  } else {
    x = String(x).toLowerCase();
    y = String(y).toLowerCase();
  }

  if (x < y) return -1 * sinal;
  if (x > y) return 1 * sinal;
  return 0;
};

const CopiarEan = ({ ean }) => {
  const [copiado, setCopiado] = useState(false);

  const copiar = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(ean);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1200);
    } catch {
      // clipboard exige contexto seguro; sem HTTPS simplesmente nao copia
    }
  };

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={`Copiar EAN ${ean}`}
      className="rounded p-1 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
    >
      {copiado ? (
        <Check className="h-4 w-4 text-dashboard-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

CopiarEan.propTypes = { ean: PropTypes.string };

const SeloMenorPreco = () => (
  <span className="rounded-md bg-dashboard-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-dashboard-success">
    menor
  </span>
);

const ResultsTable = ({ results = [] }) => {
  const [sortColumn, setSortColumn] = useState("preco");
  const [sortDirection, setSortDirection] = useState("asc");
  const isMobile = useIsMobile();

  /**
   * Menor preco por produto — nao por pagina.
   *
   * Uma busca por descricao devolve varios produtos diferentes de uma vez;
   * marcar "menor preco" olhando so a primeira linha da pagina compararia
   * Dipirona com Dorflex. O agrupamento e por `produto_id`, que e o que torna
   * duas linhas de redes diferentes o mesmo item.
   */
  const menorPorProduto = useMemo(() => {
    const mapa = new Map();
    for (const item of results) {
      const preco = numero(item.preco);
      if (!Number.isFinite(preco)) continue;
      const atual = mapa.get(item.produto_id);
      if (atual === undefined) {
        mapa.set(item.produto_id, { menor: preco, linhas: 1 });
      } else {
        atual.linhas += 1;
        if (preco < atual.menor) atual.menor = preco;
      }
    }
    return mapa;
  }, [results]);

  const linhas = useMemo(() => {
    const ordenado = [...results].sort((a, b) =>
      comparar(a, b, sortColumn, sortDirection),
    );

    return ordenado.map((item) => {
      const preco = numero(item.preco);
      const grupo = menorPorProduto.get(item.produto_id);

      // Com uma farmacia so, "menor preco" nao compara com nada — o selo viraria
      // enfeite em toda linha de produto exclusivo de uma rede.
      const comparavel =
        grupo?.linhas > 1 && grupo.menor > 0 && Number.isFinite(preco);

      return {
        ...item,
        href: montarUrl(item),
        ehMenor: comparavel && preco === grupo.menor,
        acimaEmPercent:
          comparavel && preco > grupo.menor
            ? ((preco / grupo.menor - 1) * 100).toFixed(0)
            : null,
      };
    });
  }, [results, sortColumn, sortDirection, menorPorProduto]);

  const ordenarPor = (coluna) => {
    if (sortColumn === coluna) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(coluna);
      setSortDirection(coluna === "preco" ? "asc" : "asc");
    }
  };

  if (results.length === 0) {
    return (
      <EmptyState description="Tente outra descrição ou informe o código de barras do produto." />
    );
  }

  const Seta = sortDirection === "asc" ? ArrowUp : ArrowDown;

  /* --------------------------------- Mobile -------------------------------- */
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="ordenar" className="text-sm text-muted-foreground">
            Ordenar:
          </label>
          <select
            id="ordenar"
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            {COLUNAS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-lg border border-border bg-card p-2"
            aria-label="Inverter ordem"
          >
            <Seta className="h-4 w-4" />
          </button>
        </div>

        {linhas.map((item) => (
          <LinhaCartao key={`${item.produto_id}-${item.nome_farmacia}`} item={item} />
        ))}
      </div>
    );
  }

  /* -------------------------------- Desktop -------------------------------- */
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {COLUNAS.map(({ key, label, align }) => (
                <th
                  key={key}
                  scope="col"
                  aria-sort={
                    sortColumn === key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                    align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => ordenarPor(key)}
                    className={`inline-flex items-center gap-1 transition-smooth hover:text-foreground ${
                      align === "right" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {label}
                    {sortColumn === key && <Seta className="h-3 w-3" />}
                  </button>
                </th>
              ))}
              <th scope="col" className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {linhas.map((item) => (
              <tr
                key={`${item.produto_id}-${item.nome_farmacia}`}
                className={`group border-b border-border/60 transition-smooth last:border-b-0 hover:bg-muted/40 ${
                  item.ativo === 0 ? "opacity-60" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {item.nome_farmacia}
                    {item.ativo === 0 && (
                      <span
                        title="Nenhuma coleta encontrou este produto nos últimos 30 dias"
                        className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        inativo
                      </span>
                    )}
                  </div>
                </td>

                <td className="max-w-md px-4 py-3">
                  <div className="truncate" title={item.descricao}>
                    {item.descricao}
                  </div>
                  {item.laboratorio && (
                    <div className="truncate text-xs text-muted-foreground">
                      {item.laboratorio}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="tabular text-muted-foreground">{item.EAN}</span>
                    <CopiarEan ean={item.EAN} />
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.ehMenor && <SeloMenorPreco />}
                    <span
                      className={`tabular font-semibold ${
                        item.ehMenor ? "text-dashboard-success" : "text-foreground"
                      }`}
                    >
                      {formatCurrency(item.preco)}
                    </span>
                  </div>
                  {item.acimaEmPercent && (
                    <div className="text-xs text-muted-foreground">
                      +{item.acimaEmPercent}%
                    </div>
                  )}
                </td>

                {/*
                  "Atualizado" mostra `ultima_coleta_em`, nao `data`.
                  `precos` so ganha linha quando o valor muda, entao `data`
                  responde "quando mudou pela ultima vez" — um produto com preco
                  estavel ha tres meses parecia desatualizado. Quem responde
                  "quando foi visto pela ultima vez" e o `ultima_coleta_em`.
                */}
                <td className="px-4 py-3 text-right">
                  <div className="text-foreground">
                    {formatRelativeDay(item.ultima_coleta_em ?? item.data)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    preço mudou {formatRelativeDay(item.data)}
                  </div>
                </td>

                <td className="px-2 py-3 text-right">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir na loja"
                      aria-label={`Abrir ${item.descricao} em ${item.nome_farmacia}`}
                      className="inline-flex rounded-lg p-2 text-muted-foreground opacity-0 transition-smooth hover:bg-muted hover:text-dashboard-primary focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span
                      title="Sem link cadastrado para esta farmácia"
                      className="inline-flex p-2 text-muted-foreground/30"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LinhaCartao = ({ item }) => (
  <article
    className={`rounded-card border border-border bg-card p-4 shadow-card ${
      item.ehMenor ? "ring-1 ring-dashboard-success/40" : ""
    } ${item.ativo === 0 ? "opacity-60" : ""}`}
  >
    <div className="mb-2 flex items-start justify-between gap-3">
      <span className="font-semibold text-dashboard-primary">
        {item.nome_farmacia}
      </span>
      <div className="text-right">
        <div className="flex items-center gap-1.5">
          {item.ehMenor && <SeloMenorPreco />}
          <span
            className={`tabular text-lg font-bold ${
              item.ehMenor ? "text-dashboard-success" : "text-foreground"
            }`}
          >
            {formatCurrency(item.preco)}
          </span>
        </div>
        {item.acimaEmPercent && (
          <span className="text-xs text-muted-foreground">
            +{item.acimaEmPercent}% vs. menor
          </span>
        )}
      </div>
    </div>

    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
      {item.descricao}
    </p>

    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="tabular">{item.EAN}</span>
        <CopiarEan ean={item.EAN} />
      </span>
      <span>{formatRelativeDay(item.ultima_coleta_em ?? item.data)}</span>
    </div>

    {item.href && (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-dashboard-primary transition-smooth active:bg-muted"
      >
        Abrir na loja <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )}
  </article>
);

LinhaCartao.propTypes = { item: PropTypes.object.isRequired };

ResultsTable.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object),
};

export default ResultsTable;
