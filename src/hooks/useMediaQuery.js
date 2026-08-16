import { useSyncExternalStore } from "react";

/**
 * Assina uma media query.
 *
 * Troca os `window.addEventListener('resize')` que ResultsTable e
 * PriceHistoryResults mantinham cada um por conta: aqueles re-renderizavam a
 * tabela inteira a cada pixel de arrasto da janela. `matchMedia` so avisa
 * quando o resultado da consulta muda de fato.
 */
export const useMediaQuery = (query) => {
  const subscribe = (callback) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", callback);
    return () => list.removeEventListener("change", callback);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
