const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const decimal = new Intl.NumberFormat("pt-BR");

/** 1234.5 -> "1.234,5" (contagens do painel, nao valores monetarios) */
export const formatNumberToBRL = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? decimal.format(parsed) : "-";
};

/** "40.69" -> "R$ 40,69". A API devolve preco como string decimal. */
export const formatCurrency = (value) => {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? brl.format(parsed) : "-";
};

/**
 * "2026-07-03" ou "2026-07-03 00:00:00" -> "03/07/2026".
 *
 * Corta a string em vez de passar pelo Date porque `new Date('2026-07-03')` e
 * interpretado como UTC e volta um dia atras em qualquer fuso a oeste de
 * Greenwich — inclusive o nosso.
 */
export const formatDate = (value) => {
  if (!value) return "-";
  const [date] = String(value).split(/[ T]/);
  const [year, month, day] = date.split("-");
  return day && month && year ? `${day}/${month}/${year}` : "-";
};

/** Distancia em dias entre a data informada e hoje. */
export const daysSince = (value) => {
  if (!value) return null;
  const [date] = String(value).split(/[ T]/);
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const then = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - then) / 86_400_000);
};

/** "hoje" / "ontem" / "ha 5 dias" — usado no selo de frescor da coleta. */
export const formatRelativeDay = (value) => {
  const days = daysSince(value);
  if (days === null) return "-";
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  if (days < 60) return "há 1 mês";
  return `há ${Math.floor(days / 30)} meses`;
};
