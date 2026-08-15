import PropTypes from "prop-types";
import { AlertTriangle, SearchX } from "lucide-react";

/**
 * Esqueleto de linha de tabela.
 *
 * Antes cada busca trocava a tela inteira por um GIF centralizado de altura
 * `h-screen`, o que empurrava o cabecalho pra fora e fazia uma consulta de 19s
 * parecer um recarregamento de pagina. O esqueleto mantem o layout no lugar e
 * mostra onde o conteudo vai cair.
 */
export const TableSkeleton = ({ rows = 8 }) => (
  <div className="space-y-2" role="status" aria-label="Carregando resultados">
    {Array.from({ length: rows }, (_, i) => (
      <div
        key={i}
        className="skeleton h-14 rounded-lg"
        style={{ opacity: 1 - i * 0.07 }}
      />
    ))}
  </div>
);

TableSkeleton.propTypes = { rows: PropTypes.number };

export const EmptyState = ({
  title = "Nenhum resultado encontrado",
  description,
  icon: Icon = SearchX,
}) => (
  <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border px-6 py-16 text-center">
    <Icon className="mb-3 h-10 w-10 text-muted-foreground/50" />
    <p className="font-medium text-foreground">{title}</p>
    {description && (
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    )}
  </div>
);

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.node,
  icon: PropTypes.elementType,
};

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center rounded-card border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
    <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
    <p className="font-medium text-foreground">Não foi possível carregar</p>
    <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-dashboard-primary px-4 py-2 text-sm font-medium text-white transition-smooth hover:brightness-110"
      >
        Tentar novamente
      </button>
    )}
  </div>
);

ErrorState.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};
