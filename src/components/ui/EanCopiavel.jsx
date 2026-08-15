import { useState } from "react";
import PropTypes from "prop-types";
import { Check, Copy } from "lucide-react";

/**
 * O EAN inteiro e o botao de copiar — nao so o iconinho ao lado.
 *
 * O alvo de clique passa a ser o numero, que e o que a pessoa esta olhando
 * quando quer copia-lo. Sempre interrompe a propagacao porque nas duas telas
 * onde aparece ele fica dentro de algo clicavel (a linha que abre a loja, o
 * cabecalho que expande o historico).
 */
const EanCopiavel = ({ ean, className = "" }) => {
  const [copiado, setCopiado] = useState(false);

  const copiar = async (e) => {
    e.stopPropagation();
    if (!ean) return;
    try {
      await navigator.clipboard.writeText(ean);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1200);
    } catch {
      // clipboard exige contexto seguro; sem HTTPS simplesmente não copia
    }
  };

  return (
    <button
      type="button"
      onClick={copiar}
      title={copiado ? "Copiado" : "Copiar EAN"}
      aria-label={`Copiar EAN ${ean}`}
      className={`tabular inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-smooth ${
        copiado
          ? "bg-dashboard-success/10 text-dashboard-success"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${className}`}
    >
      {ean}
      {copiado ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0" />
      )}
    </button>
  );
};

EanCopiavel.propTypes = {
  ean: PropTypes.string,
  className: PropTypes.string,
};

export default EanCopiavel;
