import PropTypes from "prop-types";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

/**
 * `change` pode vir null (metrica sem comparativo, tipo "total de produtos") ou
 * como string vinda do JSON. Normalizar aqui evita o `+null%` que aparecia no
 * cartao de total.
 */
const normalizar = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

export const MetricCard = ({
  title,
  value,
  change = null,
  /** true quando subir é ruim (preço, tempo de resposta). */
  inverso = false,
  icon = null,
  suffix = "",
}) => {
  const delta = normalizar(change);
  const subiu = delta !== null && delta > 0;
  const caiu = delta !== null && delta < 0;
  const ruim = inverso ? subiu : caiu;

  const Icone = subiu ? TrendingUp : caiu ? TrendingDown : Minus;
  const cor =
    delta === null || delta === 0
      ? "text-muted-foreground"
      : ruim
        ? "text-dashboard-danger"
        : "text-dashboard-success";

  return (
    <Card className="p-5 transition-smooth hover:-translate-y-0.5 hover:shadow-hover">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-xl bg-dashboard-primary/10 p-2.5">{icon}</div>
        {delta !== null && (
          <span
            className={`flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-xs font-semibold ${cor}`}
          >
            <Icone className="h-3.5 w-3.5" />
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>

      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <p className="tabular mt-1.5 text-2xl font-bold text-foreground">
        {value}
        {suffix && (
          <span className="ml-1 text-base font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </p>
    </Card>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  inverso: PropTypes.bool,
  icon: PropTypes.node,
  suffix: PropTypes.string,
};
