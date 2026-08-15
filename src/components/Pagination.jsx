import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Janela de páginas em volta da atual, com "..." e sempre a primeira/última. */
const janela = (atual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, atual]);
  for (let d = 1; d <= 1; d += 1) {
    if (atual - d > 1) paginas.add(atual - d);
    if (atual + d < total) paginas.add(atual + d);
  }
  if (atual <= 3) [2, 3, 4].forEach((p) => p < total && paginas.add(p));
  if (atual >= total - 2)
    [total - 1, total - 2, total - 3].forEach((p) => p > 1 && paginas.add(p));

  const ordenadas = [...paginas].sort((a, b) => a - b);
  const saida = [];
  let anterior = 0;
  for (const p of ordenadas) {
    if (p - anterior > 1) saida.push(`gap-${p}`);
    saida.push(p);
    anterior = p;
  }
  return saida;
};

const Pagination = ({ currentPage, totalPages, onPageChange, total }) => {
  if (!totalPages || totalPages <= 1) return null;

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm transition-smooth";

  return (
    <nav
      className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
      aria-label="Paginação"
    >
      <p className="text-sm text-muted-foreground">
        Página <span className="tabular font-medium">{currentPage}</span> de{" "}
        <span className="tabular font-medium">{totalPages}</span>
        {Number.isFinite(total) && (
          <>
            {" · "}
            <span className="tabular">{total.toLocaleString("pt-BR")}</span>{" "}
            resultados
          </>
        )}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${base} bg-card disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-muted`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {janela(currentPage, totalPages).map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`${base} tabular ${
                p === currentPage
                  ? "border-dashboard-primary bg-dashboard-primary font-semibold text-white"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${base} bg-card disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-muted`}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  total: PropTypes.number,
};

export default Pagination;
