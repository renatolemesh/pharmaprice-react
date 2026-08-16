import { useEffect, useState } from "react";
import { fetchFarmacias } from "../services/api";

/**
 * Rotulos usados so enquanto /api/farmacias nao responde, pra os selects de
 * filtro nao aparecerem vazios.
 *
 * De proposito nao tem dominio nenhum aqui: dominio so vem do `url_base` da
 * API. Foi um mapa fixo de dominio no front que manteve o Unipreco apontando
 * pro site antigo meses depois de a coleta migrar de marketplace.
 */
const ROTULOS_FALLBACK = [
  { farmacia_id: 1, nome_farmacia: "Raia" },
  { farmacia_id: 2, nome_farmacia: "Nissei" },
  { farmacia_id: 3, nome_farmacia: "Morifarma" },
  { farmacia_id: 4, nome_farmacia: "Unipreco" },
  { farmacia_id: 5, nome_farmacia: "Callfarma" },
  { farmacia_id: 6, nome_farmacia: "Preço Popular" },
  { farmacia_id: 7, nome_farmacia: "Panvel" },
  { farmacia_id: 8, nome_farmacia: "Pague Menos" },
];

export const useFarmacias = () => {
  const [farmacias, setFarmacias] = useState(ROTULOS_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchFarmacias(controller.signal)
      .then((lista) => {
        if (Array.isArray(lista) && lista.length) setFarmacias(lista);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          console.warn("Lista de farmácias indisponível, usando rótulos locais");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { farmacias, loading };
};
