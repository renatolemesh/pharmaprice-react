/**
 * Monta a URL do produto na loja a partir do que a API devolve.
 *
 * Substitui o mapa fixo de dominio por farmacia que existia no ResultsTable.
 * Aquele mapa errava duas redes ao mesmo tempo:
 *
 *  - Panvel: o mapa usava `https://www.panvel.com/panvel`, mas os 7.474 links
 *    da Panvel ja comecam com `/panvel`. O prefixo duplicava e todo link dava
 *    404.
 *  - Unipreco: o mapa apontava para farmaciasunipreco.com.br depois de a coleta
 *    ter migrado para farmaciasapp.com.br. Caminho do marketplace + dominio
 *    antigo colidia em outro produto — foi assim que o link do Nan Sem Lactose
 *    abriu a pagina do Impere 5mg.
 *
 * `url_base` vem em cada linha de /api/precos. Quando a proxima rede trocar de
 * dominio, muda-se uma linha na tabela `farmacias` e o front acompanha sozinho.
 *
 * A base tem os dois formatos convivendo — caminho relativo e URL absoluta —
 * entao a regra trata os dois e nunca inventa dominio.
 */
export const montarUrl = ({ url_base: urlBase, link }) => {
  if (!link) return null;
  if (/^https?:\/\//i.test(link)) return link;
  if (!urlBase) return null;
  return `${urlBase.replace(/\/+$/, "")}/${link.replace(/^\/+/, "")}`;
};
