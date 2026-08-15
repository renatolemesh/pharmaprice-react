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

## Estrutura

```
src/
  services/    http.js (cache + dedup + cancelamento), api.js, auth.js
  hooks/       useApiQuery, useDebouncedValue, useFarmacias, useMediaQuery
  contexts/    auth · theme · dashboard  (contexto+hook em .js, provider em .jsx)
  components/  tabela, filtros, ui/
  pages/       Precos · Historico · Relatorios · Dashboard · Login · Register
  utils/       url.js (montarUrl), format.js
```

Recharts (409 kB) fica fora do bundle inicial: Painel, Histórico e Relatórios
são carregados sob demanda.
