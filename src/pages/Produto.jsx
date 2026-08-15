import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, PiggyBank } from "lucide-react";
import { fetchPrecos, fetchPriceHistory } from "../services/api";
import { useApiQuery, useRetry } from "../hooks/useApiQuery";
import { useFarmacias } from "../hooks/useFarmacias";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { EmptyState, ErrorState, TableSkeleton } from "../components/ui/feedback";
import EanCopiavel from "../components/ui/EanCopiavel";
import ComparativoHistorico from "../components/ComparativoHistorico";
import { montarUrl } from "../utils/url";
import { formatCurrency, formatRelativeDay } from "../utils/format";
import { corDaFarmacia, indexarPorNome } from "../utils/paletaFarmacias";

const numero = (valor) => {
  const n = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
};

const Produto = () => {
  const { ean } = useParams();
  const [nonce, tentarDeNovo] = useRetry();
  const { farmacias } = useFarmacias();

  const filtro = ean ? [{ query: ean, searchType: "ean" }, 1] : null;

  const atuais = useApiQuery(fetchPrecos, filtro, nonce);
  const historico = useApiQuery(fetchPriceHistory, filtro, nonce);

  const mapaIds = useMemo(() => indexarPorNome(farmacias), [farmacias]);

  const { linhas, menor, maior, economia, produto } = useMemo(() => {
    const brutas = atuais.data?.data ?? [];

    const ordenadas = brutas
      .map((item) => ({ ...item, valor: numero(item.preco), href: montarUrl(item) }))
      .filter((item) => Number.isFinite(item.valor))
      .sort((a, b) => a.valor - b.valor);

    const min = ordenadas[0]?.valor;
    const max = ordenadas[ordenadas.length - 1]?.valor;

    return {
      linhas: ordenadas,
      menor: ordenadas[0],
      maior: ordenadas[ordenadas.length - 1],
      // Só faz sentido falar em economia com duas redes ou mais.
      economia:
        ordenadas.length > 1 && min > 0 ? { reais: max - min, percent: (max / min - 1) * 100 } : null,
      produto: brutas[0],
    };
  }, [atuais.data]);

  const carregando = atuais.carregando || historico.carregando;
  const erro = atuais.error || historico.error;

  return (
    <>
      <Link
        to="/precos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-smooth hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à busca
      </Link>

      {carregando && <TableSkeleton rows={6} />}

      {!carregando && erro && <ErrorState message={erro} onRetry={tentarDeNovo} />}

      {!carregando && !erro && linhas.length === 0 && (
        <EmptyState
          title="Produto não encontrado"
          description={`Nenhuma farmácia com preço para o código ${ean}. Ele pode ter sido desativado por falta de coleta.`}
        />
      )}

      {!carregando && !erro && linhas.length > 0 && (
        <>
          <header className="mb-6">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {produto?.descricao}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <EanCopiavel ean={produto?.EAN} />
              {produto?.laboratorio && <span>{produto.laboratorio}</span>}
              <span>
                {linhas.length}{" "}
                {linhas.length === 1 ? "farmácia" : "farmácias"} monitoradas
              </span>
            </div>
          </header>

          {economia && (
            <div className="mb-6 flex items-start gap-3 rounded-card border border-dashboard-success/30 bg-dashboard-success/5 p-4">
              <PiggyBank className="mt-0.5 h-5 w-5 shrink-0 text-dashboard-success" />
              <p className="text-sm">
                <span className="font-semibold text-dashboard-success">
                  {formatCurrency(economia.reais)} de diferença
                </span>{" "}
                entre a mais barata e a mais cara —{" "}
                <strong>{menor.nome_farmacia}</strong> a{" "}
                {formatCurrency(menor.valor)} contra{" "}
                <strong>{maior.nome_farmacia}</strong> a{" "}
                {formatCurrency(maior.valor)}, {economia.percent.toFixed(0)}% acima.
              </p>
            </div>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Preço por farmácia</CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-0">
              {/*
                Esta tabela é também o que sustenta o gráfico abaixo: três cores
                do tema claro ficam abaixo de 3:1 contra o fundo, e a regra é
                que a identidade nunca dependa só da cor. Aqui o nome está
                escrito ao lado do valor.
              */}
              <ul className="divide-y divide-border">
                {linhas.map((item, i) => (
                  <li
                    key={`${item.nome_farmacia}-${i}`}
                    className={`flex items-center gap-3 px-5 py-3 sm:px-6 ${
                      item.ativo === 0 ? "opacity-60" : ""
                    }`}
                  >
                    <span
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{
                        backgroundColor: corDaFarmacia(mapaIds[item.nome_farmacia]),
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {item.nome_farmacia}
                        {i === 0 && linhas.length > 1 && (
                          <span className="ml-2 rounded-md bg-dashboard-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-dashboard-success">
                            menor preço
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        visto {formatRelativeDay(item.ultima_coleta_em ?? item.data)}
                        {" · "}preço mudou {formatRelativeDay(item.data)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`tabular font-semibold ${
                          i === 0 ? "text-dashboard-success" : ""
                        }`}
                      >
                        {formatCurrency(item.valor)}
                      </p>
                      {i > 0 && menor.valor > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{((item.valor / menor.valor - 1) * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>

                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir em ${item.nome_farmacia}`}
                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-muted hover:text-dashboard-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span
                        title="Sem link cadastrado"
                        className="shrink-0 p-2 text-muted-foreground/30"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico comparado</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativoHistorico
                grupos={historico.data?.data ?? []}
                mapaIds={mapaIds}
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
};

export default Produto;
