import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Barcode, Loader2, Search, X } from "lucide-react";
import { MIN_AUTOCOMPLETE, fetchDescriptions } from "../services/api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const ehEan = (valor) => /^\d{5,15}$/.test(valor.trim());

const SearchBar = ({ onSearch, autoFocus = false, valorInicial = "" }) => {
  const [query, setQuery] = useState(valorInicial);
  const [erro, setErro] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [destaque, setDestaque] = useState(-1);

  // Termo ja pesquisado: evita reabrir o autocomplete com o texto que o proprio
  // clique na sugestao acabou de escrever na caixa. Comeca com o valor que veio
  // da URL — abrir um link de busca compartilhado nao pode disparar sugestao.
  const jaBuscado = useRef(valorInicial);
  const containerRef = useRef(null);
  const listId = useId();

  // Requisicao de sugestoes em voo, pra `buscar()` conseguir corta-la.
  const sugestoesEmVoo = useRef(null);

  const termo = useDebouncedValue(query, 350);

  useEffect(() => {
    const alvo = termo.trim();

    if (alvo === jaBuscado.current || alvo.length < MIN_AUTOCOMPLETE || ehEan(alvo)) {
      setSugestoes([]);
      setAberto(false);
      return;
    }

    const controller = new AbortController();
    sugestoesEmVoo.current = controller;
    setCarregando(true);

    fetchDescriptions(alvo, controller.signal)
      .then((data) => {
        // O /descricoes leva ~4s. Sem esta guarda, apertar Enter logo depois de
        // digitar fechava o dropdown e a resposta atrasada o reabria por cima
        // dos resultados, segundos depois.
        if (jaBuscado.current === alvo) return;
        setSugestoes(data.slice(0, 50));
        setAberto(data.length > 0);
        setDestaque(-1);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          console.error("Erro ao buscar sugestões:", error);
          setSugestoes([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    // Digitou de novo antes da resposta chegar: a requisicao antiga e cortada,
    // entao uma resposta atrasada nunca sobrescreve o que o usuario ve agora.
    return () => controller.abort();
  }, [termo]);

  useEffect(() => {
    const aoClicarFora = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const buscar = (valor) => {
    const alvo = valor.trim();
    if (!alvo) {
      setErro("Digite uma descrição ou um código de barras.");
      return;
    }

    setErro("");
    setAberto(false);
    setSugestoes([]);
    setCarregando(false);
    jaBuscado.current = alvo;
    // Corta a busca de sugestoes ainda em voo: a partir daqui ela so teria como
    // atrapalhar — o usuario ja escolheu o que queria.
    sugestoesEmVoo.current?.abort();
    setQuery(alvo);
    onSearch(alvo, ehEan(alvo) ? "ean" : "descricao");
  };

  const aoTeclar = (e) => {
    if (e.key === "ArrowDown" && aberto) {
      e.preventDefault();
      setDestaque((i) => Math.min(i + 1, sugestoes.length - 1));
    } else if (e.key === "ArrowUp" && aberto) {
      e.preventDefault();
      setDestaque((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      buscar(destaque >= 0 ? sugestoes[destaque].descricao : query);
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  };

  const limpar = () => {
    setQuery("");
    setSugestoes([]);
    setAberto(false);
    setErro("");
    jaBuscado.current = "";
  };

  const modoEan = ehEan(query);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {modoEan ? (
              <Barcode className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </span>

          <input
            type="text"
            autoFocus={autoFocus}
            placeholder="Buscar por descrição ou código de barras..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (erro) setErro("");
            }}
            onKeyDown={aoTeclar}
            onFocus={() => sugestoes.length > 0 && setAberto(true)}
            role="combobox"
            aria-expanded={aberto}
            aria-controls={listId}
            aria-autocomplete="list"
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-20 text-foreground shadow-card outline-none transition-smooth placeholder:text-muted-foreground/70 focus:border-dashboard-primary focus:ring-2 focus:ring-dashboard-primary/30"
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {carregando && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {query && (
              <button
                type="button"
                onClick={limpar}
                aria-label="Limpar busca"
                className="rounded-md p-1 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {modoEan && (
              <span className="hidden rounded-md bg-dashboard-secondary/15 px-2 py-0.5 text-xs font-medium text-dashboard-secondary sm:inline">
                EAN
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => buscar(query)}
          className="rounded-xl bg-dashboard-primary px-6 py-3 font-medium text-white shadow-card transition-smooth hover:brightness-110 active:scale-[0.98]"
        >
          Pesquisar
        </button>
      </div>

      {erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}

      {/* O servidor devolve as 107 mil descricoes quando `descricao` vem vazio
          (7,78 MB). O piso de caracteres e o que impede a tela de pedir isso. */}
      {!erro && query.trim().length > 0 && query.trim().length < MIN_AUTOCOMPLETE && !modoEan && (
        <p className="mt-2 text-sm text-muted-foreground">
          Digite ao menos {MIN_AUTOCOMPLETE} caracteres para ver sugestões.
        </p>
      )}

      {aberto && sugestoes.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-hover"
        >
          {sugestoes.map((sugestao, index) => (
            <li key={`${sugestao.descricao}-${index}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === destaque}
                onMouseEnter={() => setDestaque(index)}
                onClick={() => buscar(sugestao.descricao)}
                className={`block w-full border-b border-border/60 px-4 py-2.5 text-left text-sm last:border-b-0 transition-smooth ${
                  index === destaque
                    ? "bg-dashboard-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {sugestao.descricao}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  valorInicial: PropTypes.string,
};

export default SearchBar;
