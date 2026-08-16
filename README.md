# PharmaPrice — front

Comparador de preços de medicamentos entre 8 redes de farmácia. Consome a API
em [`api_pharmaprice`](../api_pharmaprice).

## Rodando

```bash
nvm use          # Node 24.19.0 LTS (ver .nvmrc)
npm install
npm run dev
```

Por padrão aponta para `https://api.pharmaprices.shop/api`. Para usar outra
instância, crie um `.env.local`:

```
VITE_API_URL=http://localhost:8000/api
```

| Comando         | O que faz                          |
| --------------- | ---------------------------------- |
| `npm run dev`   | servidor de desenvolvimento        |
| `npm run build` | build de produção em `dist/`       |
| `npm run lint`  | ESLint (falha com qualquer aviso)  |

## Duas coisas do backend que explicam a tela

**Link de produto se monta com `url_base`, nunca com mapa fixo.** A tabela
`informacoes_produtos.link` guarda caminho, não URL — e o domínio de uma rede
muda quando a coleta migra de plataforma. `montarUrl` ([src/utils/url.js](src/utils/url.js))
junta `url_base` + `link` e deixa passar link que já é absoluto. Não acrescente
domínio por nome de farmácia: foi assim que os links da Panvel duplicaram
`/panvel` e os do Unipreço passaram meses apontando para o site antigo.

**"Atualizado" é `ultima_coleta_em`, não `data`.** A tabela `precos` só ganha
linha quando o valor muda, então `data` responde "quando mudou pela última vez".
Quem responde "quando foi visto pela última vez" é `ultima_coleta_em`. Um
produto com preço estável há três meses tem `data` de três meses atrás e
`ultima_coleta_em` de ontem.

## Contratos que limitam a interface

- **`/api/precos` tem filtros mutuamente exclusivos** (`if/elseif/elseif`:
  ean → descrição → farmácia). Mandar descrição *e* farmácia aplica só a
  descrição, sem erro. Por isso `fetchPrecos` aceita um critério só.
  `/precos/historico` é a exceção — lá farmácia combina com a busca.
- **`/api/descricoes` sem parâmetro devolve 7,78 MB** (as 107 mil descrições).
  O piso de 3 caracteres vive em `MIN_AUTOCOMPLETE`, dentro do serviço, para
  que qualquer chamador novo herde a proteção.
- **`/precos/historico` pagina antes de agrupar.** Uma página pode trazer bem
  menos de 100 grupos, e a série de um produto pode ficar partida entre páginas.
  Buscar por EAN mantém a série junta.

## Cor das farmácias

A paleta categórica vive no [src/index.css](src/index.css) como `--serie-1..8` e
é atribuída pelo `farmacia_id`, nunca pela colocação no ranking — filtrar ou
reordenar não repinta ninguém. As oito matizes e a ordem foram validadas para
daltonismo nos dois temas (pior par adjacente ΔE 9,1 claro / 8,4 escuro). Três
cores do tema claro ficam abaixo de 3:1 contra o fundo, então toda tela que usa
a paleta traz legenda e a lista de preços com o nome escrito ao lado — a
identidade nunca depende só da cor.

Uma nona farmácia cai em cinza de propósito: gerar uma nona matiz derrubaria a
separação que as oito garantem. Quando acontecer, o caminho é agrupar ou
facetar.

## Estrutura

```
src/
  services/    http.js (cache + dedup + cancelamento), api.js, auth.js
  hooks/       useApiQuery, useDebouncedValue, useFarmacias, useMediaQuery
  contexts/    auth · theme · dashboard  (contexto+hook em .js, provider em .jsx)
  components/  tabela, filtros, ui/
  pages/       Precos · Produto · Historico · Relatorios · Dashboard · Login
  utils/       url.js (montarUrl), format.js, paletaFarmacias.js
```

A busca mora na query string (`/precos?q=dipirona&tipo=descricao`), então o
resultado pode ser compartilhado e o botão voltar do navegador desfaz a busca.
`/produto/:ean` junta todas as farmácias, a diferença entre a mais barata e a
mais cara, e o histórico das redes sobreposto num gráfico só.

Recharts (409 kB) fica fora do bundle inicial: Painel, Histórico e Relatórios
são carregados sob demanda.
