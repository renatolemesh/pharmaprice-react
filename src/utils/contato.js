/**
 * Canal de contato e suporte — o mesmo número nos dois papéis.
 *
 * Fica num módulo só porque três telas apontam para ele (landing, menu do app e
 * rodapé): número repetido em três arquivos é número que um dia diverge. Não
 * vem de variável de ambiente de propósito — é público e é o ponto da página,
 * não um segredo.
 */
const NUMERO = "5541988369266";

/** Como o número aparece escrito para quem lê. */
export const TELEFONE_EXIBICAO = "(41) 98836-9266";

/**
 * Link `wa.me` com mensagem inicial preenchida. O texto identifica de onde a
 * pessoa veio, que é o que separa um contato do site de um suporte de dentro do
 * app quando as duas conversas chegam na mesma caixa.
 */
export const linkWhatsApp = (mensagem) =>
  `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensagem)}`;

export const WHATSAPP_SITE = linkWhatsApp("Olá! Vim pelo site do PharmaPrice.");

export const WHATSAPP_SUPORTE = linkWhatsApp(
  "Olá! Preciso de suporte no PharmaPrice.",
);
