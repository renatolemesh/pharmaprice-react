import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, ChevronDown } from "lucide-react";

/**
 * Seletor de farmacias compartilhado.
 *
 * A lista vem de /api/farmacias (via useFarmacias) em vez de estar escrita a
 * mao — antes ela aparecia copiada em tres arquivos, com grafias diferentes
 * entre eles ("PP" numa tela, "Preço Popular" noutra).
 */
const PharmacyPicker = ({ farmacias, selecionadas, onChange, label = "Farmácias" }) => {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const aoClicarFora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const alternar = (id) =>
    onChange(
      selecionadas.includes(id)
        ? selecionadas.filter((v) => v !== id)
        : [...selecionadas, id],
    );

  const resumo =
    selecionadas.length === 0
      ? "Todas"
      : selecionadas.length === 1
        ? farmacias.find((f) => f.farmacia_id === selecionadas[0])?.nome_farmacia ??
          "1 selecionada"
        : `${selecionadas.length} selecionadas`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={label}
        className="flex w-full min-w-44 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-smooth hover:bg-muted"
      >
        <span className="truncate">{resumo}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-smooth ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="absolute z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-hover">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            {selecionadas.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-dashboard-primary hover:underline"
              >
                Limpar
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {farmacias.map(({ farmacia_id: id, nome_farmacia: nome }) => {
              const marcada = selecionadas.includes(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => alternar(id)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-smooth hover:bg-muted"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-smooth ${
                        marcada
                          ? "border-dashboard-primary bg-dashboard-primary text-white"
                          : "border-border"
                      }`}
                    >
                      {marcada && <Check className="h-3 w-3" />}
                    </span>
                    {nome}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

PharmacyPicker.propTypes = {
  farmacias: PropTypes.arrayOf(PropTypes.object).isRequired,
  selecionadas: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default PharmacyPicker;
