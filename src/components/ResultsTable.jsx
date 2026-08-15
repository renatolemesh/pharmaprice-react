import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { montarUrl } from "../utils/url";
import { formatCurrency, formatRelativeDay } from "../utils/format";
import { useIsMobile } from "../hooks/useMediaQuery";
import { EmptyState } from "./ui/feedback";
import EanCopiavel from "./ui/EanCopiavel";

const ROTULOS = {
  nome_farmacia: { label: "Farmácia" },
  descricao: { label: "Descrição" },
  EAN: { label: "EAN" },
  preco: { label: "Preço", align: "right" },
  ultima_coleta_em: { label: "Atualizado", align: "right" },
};

/**
 * Quem lidera a linha muda com a pergunta que a tela responde.
 *
 * Na comparacao voce ja sabe qual e o produto e esta escolhendo onde comprar,
 * entao a farmacia vem na frente. No relatorio e o contrario: sao todos os
 * produtos de uma rede, a farmacia se repete linha apos linha e quem distingue
 * uma linha da outra e o produto.
 */
const ORDEM_COLUNAS = {
  comparacao: ["nome_farmacia", "descricao", "EAN", "preco", "ultima_coleta_em"],
  catalogo: ["descricao", "nome_farmacia", "EAN", "preco", "ultima_coleta_em"],
};

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

/** Abre a loja em aba nova sem dar acesso ao `window.opener` da nossa página. */
const abrirLoja = (href) => {
  if (href) window.open(href, "_blank", "noopener,noreferrer");
};

const SeloMenorPreco = () => (
  <span className="rounded-md bg-dashboard-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-dashboard-success">
    menor
  </span>
);

const SeloInativo = () => (
  <span
    title="Nenhuma coleta encontrou este produto nos últimos 30 dias"
    className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground"
  >
    inativo
  </span>
);

/** Conteudo de cada coluna, separado da ordem em que elas aparecem. */
const CELULAS = {
  nome_farmacia: (item) => (
    <div className="flex items-center gap-2">
      {item.nome_farmacia}
      {item.ativo === 0 && <SeloInativo />}
    </div>
  ),

  descricao: (item) => (
    <>
      <div className="truncate" title={item.descricao}>
        {item.descricao}
      </div>
      {item.laboratorio && (
        <div className="truncate text-xs font-normal text-muted-foreground">
          {item.laboratorio}
        </div>
      )}
    </>
  ),

  EAN: (item) => <EanCopiavel ean={item.EAN} />,

  preco: (item) => (
    <>
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
        <div className="text-xs font-normal text-muted-foreground">
          +{item.acimaEmPercent}%
        </div>
      )}
    </>
  ),

  /*
   * "Atualizado" mostra `ultima_coleta_em`, nao `data`. `precos` so ganha linha
   * quando o valor muda, entao `data` responde "quando mudou pela ultima vez" —
   * um produto com preco estavel ha tres meses parecia desatualizado. Quem
   * responde "quando foi visto pela ultima vez" e o `ultima_coleta_em`.
   */
  ultima_coleta_em: (item) => (
    <>
      <div className="text-foreground">
        {formatRelativeDay(item.ultima_coleta_em ?? item.data)}
      </div>
      <div className="text-xs font-normal text-muted-foreground">
        preço mudou {formatRelativeDay(item.data)}
      </div>
    </>
  ),
};

const ResultsTable = ({ results = [], variante = "comparacao" }) => {
  const [sortColumn, setSortColumn] = useState("preco");
  const [sortDirection, setSortDirection] = useState("asc");
  const isMobile = useIsMobile();

  const colunas = ORDEM_COLUNAS[variante] ?? ORDEM_COLUNAS.comparacao;
  const principal = colunas[0];

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
            {colunas.map((key) => (
              <option key={key} value={key}>
                {ROTULOS[key].label}
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
          <LinhaCartao
            key={`${item.produto_id}-${item.nome_farmacia}`}
            item={item}
            catalogo={variante === "catalogo"}
          />
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
              {colunas.map((key) => {
                const { label, align } = ROTULOS[key];
                return (
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
                );
              })}
              <th scope="col" className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {linhas.map((item) => (
              <tr
                key={`${item.produto_id}-${item.nome_farmacia}`}
                onClick={() => abrirLoja(item.href)}
                className={`group border-b border-border/60 transition-smooth last:border-b-0 hover:bg-muted/40 ${
                  item.ativo === 0 ? "opacity-60" : ""
                } ${item.href ? "cursor-pointer" : ""}`}
              >
                {colunas.map((key) => (
                  <td
                    key={key}
                    className={`px-4 py-3 ${
                      ROTULOS[key].align === "right" ? "text-right" : ""
                    } ${key === "descricao" ? "max-w-md" : ""} ${
                      key === principal ? "font-medium" : ""
                    }`}
                  >
                    {CELULAS[key](item)}
                  </td>
                ))}

                <td className="px-2 py-3 text-right">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      // A linha inteira já abre a loja; sem isto o clique no
                      // ícone contaria duas vezes e abriria duas abas.
                      onClick={(e) => e.stopPropagation()}
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

const LinhaCartao = ({ item, catalogo }) => (
  <article
    onClick={() => abrirLoja(item.href)}
    className={`rounded-card border border-border bg-card p-4 shadow-card ${
      item.ehMenor ? "ring-1 ring-dashboard-success/40" : ""
    } ${item.ativo === 0 ? "opacity-60" : ""} ${
      item.href ? "cursor-pointer active:bg-muted/50" : ""
    }`}
  >
    {/* No relatorio o produto lidera e a farmacia vira etiqueta; na comparacao
        e o contrario, porque a descricao ali se repete a cada linha. */}
    <div className="mb-2 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {catalogo ? (
          <>
            <p className="line-clamp-2 text-sm font-semibold text-foreground">
              {item.descricao}
            </p>
            <span className="mt-1 inline-block rounded-md bg-dashboard-primary/10 px-2 py-0.5 text-xs font-medium text-dashboard-primary">
              {item.nome_farmacia}
            </span>
          </>
        ) : (
          <span className="font-semibold text-dashboard-primary">
            {item.nome_farmacia}
          </span>
        )}
        {item.ativo === 0 && (
          <span className="ml-1.5 inline-block">
            <SeloInativo />
          </span>
        )}
      </div>

      <div className="shrink-0 text-right">
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

    {!catalogo && (
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {item.descricao}
      </p>
    )}

    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
      <EanCopiavel ean={item.EAN} />
      <span>{formatRelativeDay(item.ultima_coleta_em ?? item.data)}</span>
    </div>

    {item.href && (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-dashboard-primary transition-smooth active:bg-muted"
      >
        Abrir na loja <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )}
  </article>
);

LinhaCartao.propTypes = {
  item: PropTypes.object.isRequired,
  catalogo: PropTypes.bool,
};

ResultsTable.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object),
  /** "comparacao": farmácia lidera · "catalogo": produto lidera (relatórios) */
  variante: PropTypes.oneOf(["comparacao", "catalogo"]),
};

export default ResultsTable;
