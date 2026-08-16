/*
 * Cruza a tabela de preço do usuário com o mercado devolvido pela API.
 *
 * A conta em si é uma divisão. O que exige cuidado é decidir quando NÃO fazer a
 * conta: a API já classifica o mercado de cada produto, e aqui esse veredito é
 * respeitado em vez de contornado. Produto que a API marcou como divergente
 * aparece sem desvio — não com desvio calculado sobre uma mediana inventada.
 */

/** Quanto o preço pode se afastar da mediana antes de virar alerta. */
export const LIMITE_PADRAO = 10;

export const SITUACOES = {
  caro: {
    rotulo: "Acima do mercado",
    // Vermelho: é o alerta que a tela existe para dar.
    classe: "text-dashboard-danger",
    fundo: "bg-dashboard-danger/10",
  },
  barato: {
    rotulo: "Abaixo do mercado",
    classe: "text-dashboard-success",
    fundo: "bg-dashboard-success/10",
  },
  alinhado: {
    rotulo: "Alinhado",
    classe: "text-muted-foreground",
    fundo: "",
  },
  divergente: {
    rotulo: "Preços incoerentes entre redes",
    classe: "text-dashboard-warning",
    fundo: "bg-dashboard-warning/10",
  },
  rede_unica: {
    rotulo: "Só uma rede tem",
    classe: "text-muted-foreground",
    fundo: "",
  },
  nao_encontrado: {
    rotulo: "Fora da base",
    classe: "text-muted-foreground",
    fundo: "",
  },
};

/**
 * @param itens      linhas lidas da planilha ({ ean, preco, custo, descricao })
 * @param mercado    resposta da API, indexada pelo EAN que foi enviado
 * @param limite     desvio em % a partir do qual o preço vira alerta
 */
export const compararComMercado = (itens, mercado, limite = LIMITE_PADRAO) =>
  itens.map((item) => {
    const dados = mercado[item.ean];

    if (!dados) {
      return { ...item, situacao: "nao_encontrado", mercado: null, desvio: null };
    }

    const resumo = dados.mercado;
    const base = {
      ...item,
      descricaoBase: dados.descricao,
      laboratorio: dados.laboratorio,
      mercado: resumo,
      precos: dados.precos,
    };

    // Sem mediana confiável não há desvio. Vale para o produto que só uma rede
    // carrega e para aquele cujas redes discordam em bloco — nos dois casos a
    // tela mostra os preços e não emite veredito.
    if (resumo.mediana === null) {
      return { ...base, situacao: resumo.estado, desvio: null };
    }

    const desvio = ((item.preco - resumo.mediana) / resumo.mediana) * 100;

    let situacao = "alinhado";
    if (desvio > limite) situacao = "caro";
    else if (desvio < -limite) situacao = "barato";

    const margem =
      item.custo && item.custo > 0
        ? ((item.preco - item.custo) / item.preco) * 100
        : null;

    return { ...base, desvio, situacao, margem };
  });

/** Contagem por situação, para os cartões do topo. */
export const resumirComparacao = (comparados) => {
  const contagem = {
    total: comparados.length,
    caro: 0,
    barato: 0,
    alinhado: 0,
    divergente: 0,
    rede_unica: 0,
    nao_encontrado: 0,
  };

  let somaDesvio = 0;
  let comDesvio = 0;

  comparados.forEach((c) => {
    contagem[c.situacao] = (contagem[c.situacao] ?? 0) + 1;
    if (c.desvio !== null && c.desvio !== undefined) {
      somaDesvio += c.desvio;
      comDesvio += 1;
    }
  });

  return {
    ...contagem,
    comparaveis: comDesvio,
    // Média dos desvios, e não desvio da média: cada produto pesa igual, senão
    // um item caro de mil reais decidiria o número sozinho.
    desvioMedio: comDesvio > 0 ? somaDesvio / comDesvio : null,
  };
};

/**
 * Redes que aparecem em pelo menos um item, na ordem do id.
 *
 * Pela ordem do id e não pela frequência: é o id que escolhe a cor da rede em
 * todo o resto do sistema, e uma coluna que troca de lugar conforme o arquivo
 * obrigaria a reler o cabeçalho a cada comparação.
 */
export const farmaciasPresentes = (comparados) => {
  const mapa = new Map();

  comparados.forEach((c) => {
    (c.precos ?? []).forEach((p) => {
      if (!mapa.has(p.farmacia_id)) {
        mapa.set(p.farmacia_id, { id: p.farmacia_id, nome: p.nome_farmacia });
      }
    });
  });

  return [...mapa.values()].sort((a, b) => a.id - b.id);
};

/**
 * O preço de uma rede num item, e se ele entrou na conta.
 *
 * Descartado continua visível: quem conhece o produto precisa ver que a rede
 * publicou aquele valor: é a evidência de que o descarte foi certo.
 */
export const precoNaFarmacia = (comparado, farmaciaId) => {
  const item = (comparado.precos ?? []).find((p) => p.farmacia_id === farmaciaId);
  if (!item) return null;

  const descartado = (comparado.mercado?.descartados ?? []).some(
    (d) => d.farmacia_id === farmaciaId,
  );

  return { preco: item.preco, descartado, link: item.link, urlBase: item.url_base };
};

/** Linha a linha, no formato que vai para o CSV de saída. */
export const paraCsv = (comparados, farmacias = farmaciasPresentes(comparados)) => {
  const cabecalho = [
    "EAN",
    "Descrição",
    "Meu preço",
    "Mediana do mercado",
    "Menor",
    "Maior",
    "Redes",
    "Desvio %",
    "Situação",
    ...farmacias.map((f) => f.nome),
  ];

  const escapar = (v) => {
    const texto = String(v ?? "");
    return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };

  const linhas = comparados.map((c) =>
    [
      c.ean,
      c.descricaoBase ?? c.descricao ?? "",
      c.preco.toFixed(2),
      c.mercado?.mediana?.toFixed(2) ?? "",
      c.mercado?.minimo?.toFixed(2) ?? "",
      c.mercado?.maximo?.toFixed(2) ?? "",
      c.mercado?.redes ?? "",
      c.desvio !== null && c.desvio !== undefined ? c.desvio.toFixed(1) : "",
      SITUACOES[c.situacao]?.rotulo ?? c.situacao,
      ...farmacias.map((f) => {
        const p = precoNaFarmacia(c, f.id);
        if (!p) return "";
        // O asterisco marca o preço que ficou de fora da mediana. Exportar sem
        // essa marca faria a planilha discordar da tela sem explicação.
        return p.descartado ? `${p.preco.toFixed(2)}*` : p.preco.toFixed(2);
      }),
    ]
      .map(escapar)
      .join(";"),
  );

  // `;` e BOM: é o que faz o Excel em português abrir o arquivo já em colunas,
  // em vez de jogar tudo na coluna A.
  return `\uFEFF${cabecalho.join(";")}\n${linhas.join("\n")}`;
};
