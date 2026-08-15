import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Download,
  ExternalLink,
  History,
  LineChart,
  Search,
  Smartphone,
} from "lucide-react";
import { useAuth } from "../contexts/auth";
import { corDaFarmacia } from "../utils/paletaFarmacias";

/*
 * Página de entrada pública — a primeira tela de quem chega sem sessão.
 *
 * Ela é estática de propósito. A alternativa seria abrir com números ao vivo,
 * mas os que valem a pena mostrar vêm de /dashboard/summary, que leva ~25s numa
 * chamada com cache frio: a tela de apresentação passaria meio minuto vazia
 * justamente para quem nunca viu o produto. Os números abaixo foram medidos
 * direto na base em 15/08/2026 e envelhecem devagar (o volume só cresce), então
 * o custo de deixá-los fixos é um número desatualizado para baixo, não uma
 * promessa falsa. Ao atualizar, rode:
 *
 *   SELECT (SELECT COUNT(*) FROM precos), (SELECT COUNT(*) FROM produtos),
 *          (SELECT COUNT(*) FROM farmacias), (SELECT MIN(data) FROM precos);
 */
const NUMEROS = [
  { valor: "8", rotulo: "redes monitoradas" },
  { valor: "106 mil", rotulo: "produtos acompanhados" },
  { valor: "1,86 mi", rotulo: "mudanças de preço registradas" },
  { valor: "jun/2024", rotulo: "início do histórico" },
];

/* Mesma ordem de /api/farmacias: o id define a cor, aqui e no gráfico. */
const FARMACIAS = [
  { id: 1, nome: "Raia" },
  { id: 2, nome: "Nissei" },
  { id: 3, nome: "Morifarma" },
  { id: 4, nome: "Unipreço" },
  { id: 5, nome: "Callfarma" },
  { id: 6, nome: "Preço Popular" },
  { id: 7, nome: "Panvel" },
  { id: 8, nome: "Pague Menos" },
];

const RECURSOS = [
  {
    icone: Search,
    titulo: "Comece digitando",
    texto:
      "O campo sugere os produtos que existem na base enquanto você escreve, então dá para escolher a apresentação certa antes de buscar. Também aceita o código de barras colado direto.",
    /* Não repete a captura do hero de propósito: aqui entra o autocomplete, que
       é a parte da busca que o hero não mostra. */
    imagem: "/screenshots/busca.webp",
    alt: "Campo de busca com a palavra neosaldina e a lista de sugestões de produto aberta abaixo",
    largura: 1424,
    altura: 470,
  },
  {
    icone: LineChart,
    titulo: "A ficha completa de um produto",
    texto:
      "Uma página por código de barras: o preço de cada rede, a diferença entre a mais barata e a mais cara, e o histórico das redes sobreposto no mesmo gráfico. Cada farmácia tem cor fixa — filtrar não repinta ninguém.",
    imagem: "/screenshots/produto.webp",
    alt: "Página do produto Neosaldina Muscular com preço em 6 farmácias e o histórico comparado",
    largura: 1440,
    altura: 1245,
  },
  {
    icone: History,
    titulo: "Histórico que não se perde",
    texto:
      "Só as mudanças viram registro — preço parado não polui a série. Filtre por produto, farmácia ou período e veja quanto cada movimento subiu ou caiu.",
    imagem: "/screenshots/historico.webp",
    alt: "Histórico de preços de um produto na Callfarma, com gráfico e tabela de variação por data",
    largura: 1440,
    altura: 900,
  },
  {
    icone: BarChart3,
    titulo: "O movimento do mercado inteiro",
    texto:
      "Quantos preços subiram, quantos caíram, quanto tempo em média um produto fica sem mexer. O painel resume a semana das oito redes de uma vez.",
    imagem: "/screenshots/painel.webp",
    alt: "Painel de análises com métricas da semana, gráfico de movimento de preços e rosca de aumentos x reduções",
    largura: 1440,
    altura: 900,
  },
];

const botaoPrimario =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-dashboard-primary px-5 py-3 font-medium text-white shadow-metric transition-smooth hover:brightness-110";

const botaoSecundario =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-medium text-foreground transition-smooth hover:bg-muted";

/** Moldura das capturas: borda + sombra, para a imagem não sangrar no fundo. */
const Captura = ({ src, alt, largura, altura, prioridade = false }) => (
  <img
    src={src}
    alt={alt}
    width={largura}
    height={altura}
    /* Largura/altura declaradas + `h-auto`: reservam o espaço antes do
       download e evitam o pulo de layout no meio da leitura. */
    className="h-auto w-full rounded-card border border-border shadow-metric"
    loading={prioridade ? "eager" : "lazy"}
    fetchPriority={prioridade ? "high" : "auto"}
    decoding="async"
  />
);

Captura.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  largura: PropTypes.number.isRequired,
  altura: PropTypes.number.isRequired,
  prioridade: PropTypes.bool,
};

const Landing = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  /* Quem já tem sessão não é mandado para o login de novo: o botão vira a
     entrada do painel. É também o que permite ver esta página logado. */
  const destino = isAuthenticated ? (isAdmin ? "/precos" : "/pricing") : "/login";
  const rotuloEntrada = isAuthenticated ? "Abrir o painel" : "Entrar";

  return (
    <div className="gradient-background min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <img
            src="/logo.png"
            alt="PharmaPrice"
            width={403}
            height={36}
            className="h-7 w-auto max-w-[60%] object-contain object-left"
          />
          <nav className="flex items-center gap-2 sm:gap-4">
            <a
              href="#recursos"
              className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:block"
            >
              Recursos
            </a>
            <a
              href="#farmacias"
              className="hidden text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground sm:block"
            >
              Farmácias
            </a>
            <Link
              to={destino}
              className="inline-flex items-center gap-2 rounded-lg bg-dashboard-primary px-4 py-2 text-sm font-medium text-white transition-smooth hover:brightness-110"
            >
              {rotuloEntrada}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dashboard-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-dashboard-success" />
              </span>
              Coleta diária nas 8 redes
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              O preço de cada farmácia,{" "}
              {/* `nowrap`: sem isto a quebra caía dentro da expressão e o
                  título terminava com um "lado" sozinho na última linha. */}
              <span className="whitespace-nowrap bg-gradient-to-r from-dashboard-primary to-dashboard-secondary bg-clip-text text-transparent">
                lado a lado
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              O PharmaPrice acompanha oito redes todos os dias e guarda cada
              mudança de preço. Busque por nome ou código de barras e veja quem
              está mais barato — e há quanto tempo.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={destino} className={botaoPrimario}>
                {rotuloEntrada}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#recursos" className={botaoSecundario}>
                Ver como funciona
              </a>
            </div>
          </div>

          <div className="mt-12 sm:mt-16">
            <Captura
              src="/screenshots/comparar.webp"
              alt="Tela de comparação de preços do PharmaPrice mostrando dipirona 500mg em várias farmácias"
              largura={1424}
              altura={900}
              prioridade
            />
          </div>
        </section>

        {/* Números */}
        <section className="border-y border-border/60 bg-card/50">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
            {NUMEROS.map(({ valor, rotulo }) => (
              <div key={rotulo} className="text-center">
                <dt className="sr-only">{rotulo}</dt>
                <dd>
                  <span className="block text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {valor}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">
                    {rotulo}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Farmácias */}
        <section id="farmacias" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            As redes que entram na comparação
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
            Cada uma tem uma cor fixa — a mesma que aparece nos gráficos, ligada
            à rede e não à posição no ranking.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {FARMACIAS.map(({ id, nome }) => (
              <li
                key={id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-card"
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: corDaFarmacia(id) }}
                />
                {nome}
              </li>
            ))}
          </ul>
        </section>

        {/* Recursos */}
        <section id="recursos" className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            O que dá para fazer
          </h2>

          <div className="mt-12 space-y-16 sm:space-y-24">
            {RECURSOS.map(
              ({ icone: Icone, titulo, texto, imagem, alt, largura, altura }, i) => (
                <article
                  key={titulo}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
                >
                  {/* No mobile o texto sempre vem antes da imagem; a alternância
                      só existe a partir de `lg`, onde há duas colunas. */}
                  <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-dashboard-primary/10 text-dashboard-primary">
                      <Icone className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {titulo}
                    </h3>
                    <p className="mt-3 text-muted-foreground">{texto}</p>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
                    <Captura
                      src={imagem}
                      alt={alt}
                      largura={largura}
                      altura={altura}
                    />
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        {/* Mobile + exportação */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 flex justify-center lg:order-1">
              <img
                src="/screenshots/mobile.webp"
                alt="PharmaPrice no celular: cada resultado vira um cartão com preço, EAN e link para a loja"
                width={390}
                height={844}
                className="h-auto w-56 rounded-[1.75rem] border-4 border-sidebar shadow-hover sm:w-64"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-dashboard-primary/10 text-dashboard-primary">
                <Smartphone className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Cabe na tela do celular
              </h3>
              <p className="mt-3 text-muted-foreground">
                No corredor da farmácia a tabela vira cartão: preço, código de
                barras e o link da loja em cada um. Sem rolagem lateral.
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3">
                  <Download className="mt-0.5 h-4 w-4 shrink-0 text-dashboard-primary" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">
                      Excel e CSV
                    </strong>{" "}
                    — o arquivo é montado no servidor e baixa pronto, com a
                    busca inteira e não só a página aberta.
                  </span>
                </li>
                <li className="flex gap-3">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-dashboard-primary" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">
                      Link direto
                    </strong>{" "}
                    — cada resultado abre o produto no site da própria rede.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-dashboard-primary" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">
                      Busca na URL
                    </strong>{" "}
                    — o resultado pode ser salvo nos favoritos ou mandado por
                    mensagem.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="gradient-card rounded-card border border-border p-8 text-center shadow-metric sm:p-14">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Pronto para comparar
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Entre com sua conta para abrir a busca, o histórico e o painel.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={destino} className={botaoPrimario}>
                {rotuloEntrada}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className={botaoSecundario}>
                  Criar conta
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p>
            PharmaPrice — preços coletados das páginas públicas das próprias
            redes.
          </p>
          <p>
            Números da base em 15/08/2026. Preços podem variar por loja e região.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
