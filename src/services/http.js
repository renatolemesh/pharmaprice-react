/**
 * Endereco da API. `VITE_API_URL` permite apontar pra uma instancia local ou de
 * homologacao sem editar codigo; sem a variavel, cai na producao de sempre.
 */
export const BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.pharmaprices.shop/api";

/** Erro de rede/API com o status HTTP preservado, pra tela decidir o que dizer. */
export class ApiError extends Error {
  constructor(message, { status = 0, body = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}/${endpoint.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, value);
  }
  return url;
};

/**
 * Cache com TTL + deduplicacao de chamadas em voo.
 *
 * A busca principal leva ~19s no servidor (o GROUP BY da latest_precos_view
 * sobre 1,86 milhao de linhas, pago duas vezes por causa do COUNT do
 * paginate). Nada no front conserta esse numero — mas da pra garantir que a
 * mesma consulta nao seja paga duas vezes: voltar uma pagina, reabrir uma
 * sugestao ou remontar o componente passa a ser instantaneo.
 */
const cache = new Map();
const inFlight = new Map();

const readCache = (key) => {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
};

export const clearApiCache = () => {
  cache.clear();
  inFlight.clear();
};

const abortError = () => {
  const erro = new Error("Requisição cancelada");
  erro.name = "AbortError";
  return erro;
};

/**
 * Amarra a promessa compartilhada ao cancelamento de UM chamador.
 *
 * Sem isto, a deduplicacao vira armadilha: quando o React 19 em StrictMode
 * monta o efeito, cancela e monta de novo, o segundo chamador reaproveitava a
 * promessa do primeiro — que ja tinha sido abortada — e ficava esperando pra
 * sempre uma resposta que nunca vinha. Aqui cada chamador desiste sozinho, e o
 * pedido de rede so e cancelado de fato quando o ultimo interessado sai.
 */
const comCancelamento = (promise, signal) => {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());

  return new Promise((resolve, reject) => {
    const aoAbortar = () => reject(abortError());
    signal.addEventListener("abort", aoAbortar, { once: true });

    const encerrar = () => signal.removeEventListener("abort", aoAbortar);
    promise.then(
      (valor) => {
        encerrar();
        resolve(valor);
      },
      (erro) => {
        encerrar();
        reject(erro);
      },
    );
  });
};

/**
 * @param {string} endpoint
 * @param {object} options
 * @param {object} [options.params]   query string
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.ttl]      ms de cache; 0 desliga cache e deduplicacao
 */
export const getJson = (endpoint, { params = {}, signal, ttl = 0, ...init } = {}) => {
  const key = buildUrl(endpoint, params).toString();
  const { headers, ...rest } = init;

  const executar = (sinalDaRede) =>
    (async () => {
      let response;
      try {
        response = await fetch(key, {
          signal: sinalDaRede,
          ...rest,
          headers: { Accept: "application/json", ...headers },
        });
      } catch (error) {
        if (error?.name === "AbortError") throw error;
        throw new ApiError("Não foi possível falar com o servidor.", {
          status: 0,
        });
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ApiError(
          payload?.message || payload?.error || `Erro ${response.status}`,
          { status: response.status, body: payload },
        );
      }

      if (ttl > 0) {
        cache.set(key, { value: payload, expiresAt: Date.now() + ttl });
      }
      return payload;
    })();

  // Sem cache: pedido exclusivo, cancelado direto pelo sinal do chamador.
  if (ttl <= 0) return executar(signal);

  const cached = readCache(key);
  if (cached !== undefined) return Promise.resolve(cached);

  let entrada = inFlight.get(key);

  // Entrada ja cancelada nunca e reaproveitada: quem chegasse depois ficaria
  // esperando pra sempre uma promessa que so sabe rejeitar com AbortError.
  if (entrada?.controller.signal.aborted) {
    inFlight.delete(key);
    entrada = undefined;
  }

  if (!entrada) {
    const controller = new AbortController();
    entrada = { controller, interessados: 0, promise: null };
    entrada.promise = executar(controller.signal);
    inFlight.set(key, entrada);
    entrada.promise
      .finally(() => {
        if (inFlight.get(key) === entrada) inFlight.delete(key);
      })
      .catch(() => {});
  }

  // Contagem de interessados: o fetch só é abortado quando todos desistem.
  entrada.interessados += 1;
  signal?.addEventListener(
    "abort",
    () => {
      entrada.interessados -= 1;
      if (entrada.interessados > 0) return;
      // Tirar do mapa ANTES de abortar: o `.finally` que faria isso so roda no
      // proximo microtask, e em StrictMode o efeito remonta antes disso.
      if (inFlight.get(key) === entrada) inFlight.delete(key);
      entrada.controller.abort();
    },
    { once: true },
  );

  return comCancelamento(entrada.promise, signal);
};

export const postJson = async (endpoint, body, { token, ...init } = {}) => {
  const response = await fetch(buildUrl(endpoint).toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    ...init,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.error || `Erro ${response.status}`,
      { status: response.status, body: payload },
    );
  }

  return payload;
};

export const getBlob = async (endpoint, params = {}, { signal } = {}) => {
  const response = await fetch(buildUrl(endpoint, params).toString(), {
    signal,
  });
  if (!response.ok) {
    throw new ApiError(`Erro ${response.status} ao exportar`, {
      status: response.status,
    });
  }
  return response.blob();
};
