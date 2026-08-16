import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  Lock,
  Upload,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState } from "../components/ui/feedback";
import { baixarBlob, fetchMercado, LOTE_MERCADO } from "../services/api";
import { formatCurrency } from "../utils/format";
import {
  detectarColunas,
  detectarSeparador,
  lerTexto,
  montarItens,
  parsearCsv,
} from "../utils/planilha";
import {
  compararComMercado,
  farmaciasPresentes,
  LIMITE_PADRAO,
  paraCsv,
  precoNaFarmacia,
  resumirComparacao,
  SITUACOES,
} from "../utils/comparacao";
import { corDaFarmacia } from "../utils/paletaFarmacias";

const ETAPAS = { VAZIO: "vazio", CONFERINDO: "conferindo", BUSCANDO: "buscando", PRONTO: "pronto" };

const PAPEIS = [
  { chave: "ean", rotulo: "Código de barras", obrigatorio: true },
  { chave: "preco", rotulo: "Seu preço", obrigatorio: true },
  { chave: "custo", rotulo: "Custo (opcional)", obrigatorio: false },
  { chave: "descricao", rotulo: "Descrição (opcional)", obrigatorio: false },
];

const seletor =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-smooth focus:border-dashboard-primary";

const Cartao = ({ titulo, valor, detalhe, destaque }) => (
  <div className="gradient-card rounded-card border border-border p-4 shadow-card">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</p>
    <p className={`mt-1 text-2xl font-bold tabular ${destaque ?? "text-foreground"}`}>
      {valor}
    </p>
    {detalhe && <p className="mt-0.5 text-xs text-muted-foreground">{detalhe}</p>}
  </div>
);

Cartao.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.node.isRequired,
  detalhe: PropTypes.node,
  destaque: PropTypes.string,
};

const Comparador = () => {
  const [etapa, setEtapa] = useState(ETAPAS.VAZIO);
  const [erro, setErro] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [planilha, setPlanilha] = useState(null);
  const [colunas, setColunas] = useState(null);
  const [progresso, setProgresso] = useState({ feitos: 0, total: 0 });
  const [resultado, setResultado] = useState(null);
  const [limite, setLimite] = useState(LIMITE_PADRAO);
  const [filtro, setFiltro] = useState("todos");
  const inputRef = useRef(null);

  const reiniciar = () => {
    setEtapa(ETAPAS.VAZIO);
    setErro(null);
    setArquivo(null);
    setPlanilha(null);
    setColunas(null);
    setResultado(null);
    setFiltro("todos");
    if (inputRef.current) inputRef.current.value = "";
  };

  const carregar = async (file) => {
    setErro(null);
    try {
      const { texto, codificacao } = await lerTexto(file);
      const separador = detectarSeparador(texto);
      const dados = parsearCsv(texto, separador);

      if (dados.linhas.length === 0) {
        setErro("O arquivo não tem nenhuma linha além do cabeçalho.");
        return;
      }

      setArquivo({ nome: file.name, codificacao, separador, linhas: dados.linhas.length });
      setPlanilha(dados);
      setColunas(detectarColunas(dados));
      setEtapa(ETAPAS.CONFERINDO);
    } catch (e) {
      setErro(`Não foi possível ler o arquivo: ${e.message}`);
    }
  };

  const comparar = async () => {
    setEtapa(ETAPAS.BUSCANDO);
    setErro(null);

    const { itens, descartes } = montarItens(planilha, colunas);

    if (itens.length === 0) {
      setErro(
        "Nenhuma linha aproveitável. Confira se as colunas de código de barras e preço estão certas.",
      );
      setEtapa(ETAPAS.CONFERINDO);
      return;
    }

    // Um EAN pode repetir na planilha (mesma loja, filiais diferentes). Consulta
    // uma vez só.
    const unicos = [...new Set(itens.map((i) => i.ean))];
    const lotes = [];
    for (let i = 0; i < unicos.length; i += LOTE_MERCADO) {
      lotes.push(unicos.slice(i, i + LOTE_MERCADO));
    }

    setProgresso({ feitos: 0, total: lotes.length });

    try {
      const mercado = {};
      for (let i = 0; i < lotes.length; i += 1) {
        // Sequencial de propósito: são consultas pesadas no banco, e disparar
        // dez de uma vez deixaria a busca de todo mundo lenta para adiantar uma
        // barra de progresso.
        const resposta = await fetchMercado(lotes[i]);
        Object.assign(mercado, resposta.data ?? {});
        setProgresso({ feitos: i + 1, total: lotes.length });
      }

      setResultado({ itens, descartes, mercado });
      setEtapa(ETAPAS.PRONTO);
    } catch (e) {
      setErro(`A consulta ao mercado falhou: ${e.message}`);
      setEtapa(ETAPAS.CONFERINDO);
    }
  };

  const comparados = useMemo(
    () => (resultado ? compararComMercado(resultado.itens, resultado.mercado, limite) : []),
    [resultado, limite],
  );

  const resumo = useMemo(() => resumirComparacao(comparados), [comparados]);

  const visiveis = useMemo(
    () => (filtro === "todos" ? comparados : comparados.filter((c) => c.situacao === filtro)),
    [comparados, filtro],
  );

  const farmacias = useMemo(() => farmaciasPresentes(comparados), [comparados]);

  const exportar = () => {
    const blob = new Blob([paraCsv(comparados, farmacias)], {
      type: "text/csv;charset=utf-8",
    });
    baixarBlob(blob, "comparacao.csv");
  };

  const descartadas = resultado
    ? Object.values(resultado.descartes).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <>
      <PageHeader
        title="Comparar minha tabela"
        description="Suba sua lista de preços e veja onde você está fora do mercado."
        actions={
          etapa === ETAPAS.PRONTO && (
            <>
              <button
                type="button"
                onClick={exportar}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-smooth hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
              <button
                type="button"
                onClick={reiniciar}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-smooth hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Outro arquivo
              </button>
            </>
          )
        }
      />

      {erro && <ErrorState message={erro} />}

      {etapa === ETAPAS.VAZIO && (
        <div className="gradient-card rounded-card border border-border p-8 text-center shadow-card">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-dashboard-primary" />
          <h2 className="mt-4 text-lg font-semibold">Escolha o arquivo CSV</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Precisa ter uma coluna com o código de barras e outra com o seu preço.
            Os nomes das colunas não importam — eles são identificados pelo
            conteúdo, e você confere antes de comparar.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-dashboard-primary px-5 py-2.5 font-medium text-white transition-smooth hover:brightness-110">
            <Upload className="h-4 w-4" />
            Selecionar arquivo
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.txt,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && carregar(e.target.files[0])}
            />
          </label>

          <p className="mx-auto mt-6 flex max-w-lg items-start gap-2 rounded-lg bg-muted/60 px-4 py-3 text-left text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong className="font-medium text-foreground">
                Seus preços não saem daqui.
              </strong>{" "}
              O arquivo é lido no seu navegador. Para o servidor vão só os
              códigos de barras, para buscar o preço das redes — a comparação é
              feita nesta tela.
            </span>
          </p>
        </div>
      )}

      {etapa === ETAPAS.CONFERINDO && planilha && (
        <div className="space-y-4">
          <div className="gradient-card rounded-card border border-border p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">{arquivo.nome}</h2>
              <p className="text-xs text-muted-foreground">
                {arquivo.linhas.toLocaleString("pt-BR")} linhas · separador{" "}
                <code className="rounded bg-muted px-1">{arquivo.separador}</code> ·{" "}
                {arquivo.codificacao}
              </p>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Confira as colunas. Troque se algo estiver errado.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PAPEIS.map(({ chave, rotulo, obrigatorio }) => (
                <div key={chave}>
                  <label
                    htmlFor={`col-${chave}`}
                    className="mb-1 block text-xs font-medium text-muted-foreground"
                  >
                    {rotulo}
                  </label>
                  <select
                    id={`col-${chave}`}
                    className={seletor}
                    value={colunas[chave] ?? ""}
                    onChange={(e) =>
                      setColunas({
                        ...colunas,
                        [chave]: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">{obrigatorio ? "— escolha —" : "não usar"}</option>
                    {planilha.cabecalho.map((titulo, i) => (
                      <option key={`${titulo}-${i}`} value={i}>
                        {titulo || `Coluna ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {colunas.ean !== null && colunas.confiancaEan < 0.9 && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-dashboard-warning/10 px-3 py-2 text-xs text-dashboard-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Nem todos os valores dessa coluna passam na validação de código
                de barras. Confira se é ela mesma.
              </p>
            )}

            {/* Amostra: o jeito mais rápido de a pessoa ver que escolhemos a
                coluna errada é olhar três linhas de exemplo. */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    {planilha.cabecalho.map((titulo, i) => (
                      <th key={`h-${i}`} className="whitespace-nowrap px-2 py-1 font-medium">
                        {titulo || `Coluna ${i + 1}`}
                        {colunas.ean === i && " (código)"}
                        {colunas.preco === i && " (preço)"}
                        {colunas.custo === i && " (custo)"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {planilha.linhas.slice(0, 3).map((linha, li) => (
                    <tr key={`l-${li}`} className="border-t border-border">
                      {planilha.cabecalho.map((_, ci) => (
                          <td key={`c-${li}-${ci}`} className="whitespace-nowrap px-2 py-1">
                          {linha[ci]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={comparar}
                disabled={colunas.ean === null || colunas.preco === null}
                className="rounded-lg bg-dashboard-primary px-5 py-2.5 font-medium text-white transition-smooth hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Comparar
              </button>
              <button
                type="button"
                onClick={reiniciar}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Trocar arquivo
              </button>
            </div>
          </div>
        </div>
      )}

      {etapa === ETAPAS.BUSCANDO && (
        <div className="gradient-card rounded-card border border-border p-10 text-center shadow-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-dashboard-primary" />
          <p className="mt-4 font-medium">Buscando preços das redes…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            lote {progresso.feitos} de {progresso.total}
          </p>
        </div>
      )}

      {etapa === ETAPAS.PRONTO && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Cartao
              titulo="Acima do mercado"
              valor={resumo.caro.toLocaleString("pt-BR")}
              detalhe={`mais de ${limite}% acima da mediana`}
              destaque="text-dashboard-danger"
            />
            <Cartao
              titulo="Abaixo do mercado"
              valor={resumo.barato.toLocaleString("pt-BR")}
              detalhe="pode haver margem na mesa"
              destaque="text-dashboard-success"
            />
            <Cartao
              titulo="Comparáveis"
              valor={resumo.comparaveis.toLocaleString("pt-BR")}
              detalhe={`de ${resumo.total.toLocaleString("pt-BR")} itens do arquivo`}
            />
            <Cartao
              titulo="Desvio médio"
              valor={
                resumo.desvioMedio === null
                  ? "—"
                  : `${resumo.desvioMedio > 0 ? "+" : ""}${resumo.desvioMedio.toFixed(1)}%`
              }
              detalhe="média dos itens comparáveis"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-card p-3">
            <label htmlFor="limite" className="text-sm text-muted-foreground">
              Alertar acima de
            </label>
            <input
              id="limite"
              type="number"
              min="1"
              max="90"
              value={limite}
              onChange={(e) => setLimite(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-sm tabular"
            />
            <span className="text-sm text-muted-foreground">% de desvio</span>

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className={`${seletor} ml-auto w-auto`}
            >
              <option value="todos">Todos ({resumo.total})</option>
              <option value="caro">Acima do mercado ({resumo.caro})</option>
              <option value="barato">Abaixo do mercado ({resumo.barato})</option>
              <option value="alinhado">Alinhados ({resumo.alinhado})</option>
              <option value="divergente">Incoerentes ({resumo.divergente})</option>
              <option value="rede_unica">Só uma rede ({resumo.rede_unica})</option>
              <option value="nao_encontrado">Fora da base ({resumo.nao_encontrado})</option>
            </select>
          </div>

          {(descartadas > 0 || resumo.nao_encontrado > 0) && (
            <div className="rounded-card border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {descartadas > 0 && (
                <p>
                  <strong className="text-foreground">
                    {descartadas.toLocaleString("pt-BR")} linhas
                  </strong>{" "}
                  do arquivo não entraram:{" "}
                  {resultado.descartes.semEan > 0 && `${resultado.descartes.semEan} sem código, `}
                  {resultado.descartes.eanInvalido > 0 &&
                    `${resultado.descartes.eanInvalido} com código inválido, `}
                  {resultado.descartes.notacaoCientifica > 0 &&
                    `${resultado.descartes.notacaoCientifica} com código destruído pelo Excel (7,89E+12), `}
                  {resultado.descartes.semPreco > 0 && `${resultado.descartes.semPreco} sem preço`}
                </p>
              )}
              {resumo.nao_encontrado > 0 && (
                <p className="mt-1">
                  {resumo.nao_encontrado.toLocaleString("pt-BR")} produtos não
                  existem na base monitorada — as redes acompanhadas não vendem
                  esses itens.
                </p>
              )}
            </div>
          )}

          <div className="overflow-x-auto rounded-card border border-border bg-card">
            {/* `min-w` em vez de deixar o navegador espremer: com uma coluna por
                rede o nome do produto virava cinco linhas de duas palavras. Aqui
                a tabela rola de lado e cada célula continua legível. */}
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="min-w-[280px] px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 text-right font-medium">Seu preço</th>
                  <th className="px-4 py-3 text-right font-medium">Mediana</th>
                  <th className="px-4 py-3 text-right font-medium">Desvio</th>
                  {/* Uma coluna por rede, com a mesma cor que ela tem nos
                      gráficos. A borda à esquerda separa o seu lado da tabela
                      do lado do mercado. */}
                  {farmacias.map((f, i) => (
                    <th
                      key={f.id}
                      className={`px-3 py-3 text-right font-medium whitespace-nowrap ${
                        i === 0 ? "border-l border-border" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: corDaFarmacia(f.id) }}
                        />
                        {f.nome}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiveis.slice(0, 500).map((c) => {
                  const situacao = SITUACOES[c.situacao] ?? SITUACOES.alinhado;
                  return (
                    <tr key={c.ean} className={`border-b border-border/60 ${situacao.fundo}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {c.descricaoBase ?? c.descricao ?? "—"}
                        </p>
                        <p className="tabular text-xs text-muted-foreground">
                          {c.ean}
                          {c.mercado && ` · ${c.mercado.redes} rede${c.mercado.redes > 1 ? "s" : ""}`}
                          {c.mercado?.descartados?.length > 0 &&
                            ` · ${c.mercado.descartados[0].nome_farmacia} descartada (preço fora de escala)`}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right tabular font-medium">
                        {formatCurrency(c.preco)}
                      </td>
                      <td className="px-4 py-3 text-right tabular">
                        {c.mercado?.mediana ? formatCurrency(c.mercado.mediana) : "—"}
                      </td>
                      <td className={`px-4 py-3 text-right tabular font-medium ${situacao.classe}`}>
                        {c.desvio === null || c.desvio === undefined ? (
                          <span className="text-xs">{situacao.rotulo}</span>
                        ) : (
                          `${c.desvio > 0 ? "+" : ""}${c.desvio.toFixed(1)}%`
                        )}
                      </td>

                      {farmacias.map((f, i) => {
                        const p = precoNaFarmacia(c, f.id);
                        // Só destaca o menor quando há mediana — num item que a
                        // API marcou como incoerente, apontar "o mais barato"
                        // seria dar a conclusão que a linha acabou de dizer que
                        // não dá para tirar.
                        const eMenor =
                          p &&
                          !p.descartado &&
                          c.mercado?.mediana !== null &&
                          c.mercado?.minimo === p.preco;

                        return (
                          <td
                            key={f.id}
                            className={`px-3 py-3 text-right tabular whitespace-nowrap ${
                              i === 0 ? "border-l border-border" : ""
                            } ${
                              p?.descartado
                                ? // Descartado continua à vista, mas riscado: é a
                                  // evidência de que o descarte foi certo, e
                                  // escondê-lo faria a mediana parecer arbitrária.
                                  "text-muted-foreground/60 line-through"
                                : eMenor
                                  ? "font-semibold text-dashboard-success"
                                  : "text-foreground"
                            }`}
                            title={
                              p?.descartado
                                ? "Fora de escala — não entrou na mediana"
                                : undefined
                            }
                          >
                            {p ? formatCurrency(p.preco) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {visiveis.length > 500 && (
            <p className="text-center text-xs text-muted-foreground">
              Mostrando as primeiras 500 de {visiveis.length.toLocaleString("pt-BR")}.
              O arquivo exportado traz todas.
            </p>
          )}

          {visiveis.length === 0 && (
            <EmptyState
              icon={FileSpreadsheet}
              title="Nenhum item nesse filtro"
              description="Troque o filtro ou ajuste o limite de desvio."
            />
          )}
        </div>
      )}
    </>
  );
};

export default Comparador;
