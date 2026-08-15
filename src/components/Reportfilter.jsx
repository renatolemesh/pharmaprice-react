import { useState } from "react";
import PropTypes from "prop-types";
import { useFarmacias } from "../hooks/useFarmacias";
import PharmacyPicker from "./PharmacyPicker";

const ReportFilter = ({ onGenerateReport, carregando }) => {
  const [priceType, setPriceType] = useState("current");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPharmacies, setSelectedPharmacies] = useState([]);
  const [erro, setErro] = useState("");
  const { farmacias } = useFarmacias();

  const historico = priceType === "historical";

  const enviar = (e) => {
    e.preventDefault();
    if (historico && startDate && endDate && startDate > endDate) {
      setErro("A data inicial é posterior à data final.");
      return;
    }
    setErro("");
    onGenerateReport({ priceType, startDate, endDate, selectedPharmacies });
  };

  const campo =
    "rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-smooth focus:border-dashboard-primary focus:ring-2 focus:ring-dashboard-primary/30";

  return (
    <form
      onSubmit={enviar}
      className="mb-6 rounded-card border border-border bg-card p-4 shadow-card"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Farmácias
          </span>
          <PharmacyPicker
            farmacias={farmacias}
            selecionadas={selectedPharmacies}
            onChange={setSelectedPharmacies}
          />
        </div>

        <div>
          <label
            htmlFor="tipo-preco"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Tipo
          </label>
          <select
            id="tipo-preco"
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className={campo}
          >
            <option value="current">Preço atual</option>
            <option value="historical">Histórico de preços</option>
          </select>
        </div>

        {historico && (
          <>
            <div>
              <label
                htmlFor="relatorio-inicio"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                De
              </label>
              <input
                id="relatorio-inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={campo}
              />
            </div>
            <div>
              <label
                htmlFor="relatorio-fim"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Até
              </label>
              <input
                id="relatorio-fim"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={campo}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="rounded-lg bg-dashboard-primary px-6 py-2.5 text-sm font-medium text-white transition-smooth hover:brightness-110 disabled:opacity-60"
        >
          {carregando ? "Gerando..." : "Gerar relatório"}
        </button>
      </div>

      {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
    </form>
  );
};

ReportFilter.propTypes = {
  onGenerateReport: PropTypes.func.isRequired,
  carregando: PropTypes.bool,
};

export default ReportFilter;
