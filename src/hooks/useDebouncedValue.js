import { useEffect, useState } from "react";

/**
 * Versao atrasada de um valor.
 *
 * Substitui o `lodash.debounce` embrulhado em `useCallback` sem dependencias
 * que o SearchBar usava — aquele padrao congelava a closure na primeira
 * renderizacao e obrigava um `useRef` extra so pra cancelar chamadas pendentes
 * depois de uma busca. Aqui o cleanup do efeito ja faz esse trabalho.
 */
export const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
