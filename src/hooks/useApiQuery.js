import { useCallback, useEffect, useState } from "react";

/**
 * Consulta a API com cancelamento e estado derivado.
 *
 * Substitui o trio `useState(loading) + useState(erro) + useState(dados)` que
 * as quatro telas repetiam. Duas escolhas explicam o formato:
 *
 * 1. `carregando` e derivado — vale "a chave pedida ainda nao e a chave
 *    respondida". A alternativa (`setCarregando(true)` no corpo do efeito)
 *    dispara uma renderizacao em cascata a cada busca, que e justamente o que a
 *    regra react-hooks/set-state-in-effect aponta.
 *
 * 2. Os argumentos viajam serializados na chave e sao desserializados dentro do
 *    efeito. Assim a lista de dependencias e uma string estavel: um objeto de
 *    filtros recriado a cada renderizacao nao redispara a consulta sozinho.
 *    Isso importa aqui porque a busca custa ~19s no servidor.
 *
 * @param {(...args: any[]) => Promise<any>} fetcher  funcao de modulo, estavel
 * @param {any[] | null} args   argumentos serializaveis; null desliga a consulta
 * @param {number} [nonce]      muda pra forcar nova tentativa
 */
export const useApiQuery = (fetcher, args, nonce = 0) => {
  const chave = args ? JSON.stringify([args, nonce]) : null;
  const [resultado, setResultado] = useState({
    chave: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (chave === null) return undefined;

    const [argumentos] = JSON.parse(chave);
    const controller = new AbortController();

    fetcher(...argumentos, controller.signal)
      .then((data) => setResultado({ chave, data, error: null }))
      .catch((error) => {
        // Pedido cancelado nao e falha: outro ja esta no lugar dele.
        if (error?.name === "AbortError") return;
        setResultado({ chave, data: null, error: error.message });
      });

    return () => controller.abort();
  }, [chave, fetcher]);

  const respondida = chave !== null && resultado.chave === chave;

  return {
    data: respondida ? resultado.data : null,
    error: respondida ? resultado.error : null,
    carregando: chave !== null && !respondida,
    inativa: chave === null,
  };
};

/** Contador de tentativa pro botao "tentar novamente". */
export const useRetry = () => {
  const [nonce, setNonce] = useState(0);
  return [nonce, useCallback(() => setNonce((n) => n + 1), [])];
};
