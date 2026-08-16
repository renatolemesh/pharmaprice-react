import { useState } from "react";
import PropTypes from "prop-types";
import { Search } from "lucide-react";
import { useFarmacias } from "../hooks/useFarmacias";
import PharmacyPicker from "./PharmacyPicker";

const ehEan = (valor) => /^\d{5,15}$/.test(valor.trim());

const PriceHistoryFilter = ({ onSearch, carregando }) => {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [farmacias, setFarmacias] = useState([]);
  const [erro, setErro] = useState("");
  const { farmacias: lista } = useFarmacias();

  const enviar = (e) => {
    e.preventDefault();

    if (!query && !startDate && !endDate && farmacias.length === 0) {
      setErro("Preencha ao menos um filtro para pesquisar.");
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setErro("A data inicial é posterior à data final.");
      return;
    }

    setErro("");
    onSearch({
      query,
      searchType: ehEan(query) ? "ean" : "descricao",
      startDate,
      endDate,
      farmacias,
    });
  };

  const campo =
    "rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none transition-smooth focus:border-dashboard-primary focus:ring-2 focus:ring-dashboard-primary/30";

  return (
    <form
      onSubmit={enviar}
      className="mb-6 rounded-card border border-border bg-card p-4 shadow-card"
    >
      {/*
        No celular vira grade de duas colunas: empilhar os quatro campos em
        largura total empurrava o resultado pra fora da primeira tela inteira.
        As duas datas dividem uma linha, que e como elas sao lidas mesmo.
      */}
      <div className="grid grid-cols-2 gap-3 lg:flex lg:items-end">
        <div className="col-span-2 lg:flex-1">
          <label
            htmlFor="historico-busca"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Produto
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="historico-busca"
              type="text"
              placeholder="Descrição ou código de barras"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${campo} w-full pl-9`}
            />
          </div>
        </div>

        <div className="col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Farmácias
          </span>
          <PharmacyPicker
            farmacias={lista}
            selecionadas={farmacias}
            onChange={setFarmacias}
          />
        </div>

        <div>
          <label
            htmlFor="historico-inicio"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            De
          </label>
          <input
            id="historico-inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${campo} w-full`}
          />
        </div>

        <div>
          <label
            htmlFor="historico-fim"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Até
          </label>
          <input
            id="historico-fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`${campo} w-full`}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="col-span-2 rounded-lg bg-dashboard-primary px-6 py-2.5 text-sm font-medium text-white transition-smooth hover:brightness-110 disabled:opacity-60 lg:col-span-1"
        >
          {carregando ? "Buscando..." : "Pesquisar"}
        </button>
      </div>

      {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}

      {/*
        A paginacao do /precos/historico acontece antes do agrupamento: o
        controller pagina 100 linhas cruas e so depois junta por produto. Uma
        pagina pode vir com bem menos de 100 grupos, e o historico de um mesmo
        produto pode aparecer partido entre duas paginas. Buscar por EAN e o
        que mantem a serie inteira junta.
      */}
      {query && !ehEan(query) && (
        <p className="mt-3 text-xs text-muted-foreground">
          Dica: buscando pelo código de barras, a série de preços de um produto
          não fica dividida entre páginas.
        </p>
      )}
    </form>
  );
};

PriceHistoryFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
  carregando: PropTypes.bool,
};

export default PriceHistoryFilter;
