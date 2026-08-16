/*
 * Leitura da planilha de preços do próprio usuário.
 *
 * Tudo aqui roda no navegador de propósito: tabela de preço é dado comercial, e
 * a comparação não precisa que ela saia da máquina. Para a API vai só a lista
 * de códigos de barras.
 *
 * O arquivo vem de ERP de farmácia, e é lá que mora a dificuldade. Um CSV
 * exportado do Excel em português quase nunca é `a,b,c` em UTF-8: costuma ser
 * separado por `;`, com decimal em vírgula e gravado em ISO-8859-1. Cada uma
 * dessas três coisas, sozinha, transforma o arquivo em lixo silencioso — números
 * lidos como texto, acentos trocados, colunas coladas. Então nada é suposto:
 * cada uma é detectada e pode ser corrigida à mão na tela.
 */

/**
 * Assinatura de UTF-8 lido como Latin-1.
 *
 * Todo acento latino em UTF-8 é um par que começa em `C3` ou `C2`. Lidos como
 * Latin-1, esses bytes viram `Ã` e `Â`, sempre seguidos de um caractere na
 * faixa de controle U+0080–U+00BF — que texto de verdade não usa. É daí que sai
 * o `FarmÃ¡cia` clássico.
 */
const MOJIBAKE = /[ÃÂ][\u0080-\u00BF]/g;

/**
 * Lê o arquivo decidindo entre UTF-8 e ISO-8859-1.
 *
 * A primeira versão perguntava se havia ALGUM caractere de substituição na
 * decodificação UTF-8, e caía para Latin-1 se houvesse. Frágil por construção:
 * um único byte truncado — um download interrompido no meio de um caractere de
 * dois bytes — virava o arquivo inteiro, e todo acento passava a aparecer como
 * `Ã§`. Foi o que aconteceu com um relatório exportado do próprio sistema, que
 * voltou com `ï»¿FarmÃ¡cia` no cabeçalho.
 *
 * Trocar presença por proporção também não resolve: num arquivo de duas linhas,
 * um byte ruim já é 2% do texto. O que decide de verdade é comparar as duas
 * leituras e ver qual delas produz mais absurdo — cada uma erra de um jeito
 * reconhecível, e o jeito de errar é mais informativo que a quantidade.
 */
export const lerTexto = async (arquivo) => {
  const buffer = await arquivo.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // O BOM decide sozinho: `EF BB BF` só existe em arquivo UTF-8. O
  // decodificador remove o marcador junto.
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { texto: new TextDecoder("utf-8").decode(buffer), codificacao: "utf-8" };
  }

  const utf8 = new TextDecoder("utf-8").decode(buffer);
  const latin = new TextDecoder("iso-8859-1").decode(buffer);

  // Ler Latin-1 como UTF-8 gera caractere de substituição; ler UTF-8 como
  // Latin-1 gera mojibake. Cada leitura é avaliada pelo erro que ela própria
  // cometeria, e ganha a que erra menos.
  const erroUtf8 = (utf8.match(/�/g) ?? []).length;
  const erroLatin = (latin.match(MOJIBAKE) ?? []).length;

  // Empate fica em UTF-8: é o que sai de qualquer sistema atual, e o arquivo
  // sem nenhum acento (empate em zero) dá o mesmo texto nas duas leituras.
  return erroLatin < erroUtf8
    ? { texto: latin, codificacao: "iso-8859-1" }
    : { texto: utf8, codificacao: "utf-8" };
};

/**
 * Descobre o separador contando candidatos na primeira linha não vazia.
 *
 * Conta na linha de cabeçalho e não no arquivo todo: descrição de produto tem
 * vírgula ("Dipirona 500mg, caixa com 20"), e contar o arquivo inteiro faria a
 * vírgula ganhar de um `;` que é o separador de verdade.
 */
export const detectarSeparador = (texto) => {
  const primeira = texto.split(/\r?\n/).find((l) => l.trim() !== "") ?? "";

  const candidatos = [";", ",", "\t", "|"];
  let melhor = ";";
  let maior = 0;

  candidatos.forEach((sep) => {
    const n = primeira.split(sep).length - 1;
    if (n > maior) {
      maior = n;
      melhor = sep;
    }
  });

  return maior > 0 ? melhor : ";";
};

/** Divide uma linha respeitando aspas, que o `split` sozinho ignora. */
const dividirLinha = (linha, separador) => {
  const campos = [];
  let atual = "";
  let dentroDeAspas = false;

  for (let i = 0; i < linha.length; i += 1) {
    const c = linha[i];

    if (c === '"') {
      // Aspas dobradas dentro de campo entre aspas são uma aspa literal.
      if (dentroDeAspas && linha[i + 1] === '"') {
        atual += '"';
        i += 1;
      } else {
        dentroDeAspas = !dentroDeAspas;
      }
    } else if (c === separador && !dentroDeAspas) {
      campos.push(atual);
      atual = "";
    } else {
      atual += c;
    }
  }

  campos.push(atual);
  return campos.map((c) => c.trim());
};

export const parsearCsv = (texto, separador) => {
  const linhas = texto
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");

  if (linhas.length === 0) return { cabecalho: [], linhas: [] };

  // Cinto de segurança para o BOM: se algum caminho de decodificação o deixar
  // passar, ele gruda no primeiro título — que então não casa com nada, e é
  // invisível na tela, porque o marcador não tem desenho.
  const cabecalho = dividirLinha(linhas[0].replace(/^\uFEFF/, ""), separador);
  const corpo = linhas.slice(1).map((l) => dividirLinha(l, separador));

  return { cabecalho, linhas: corpo };
};

/**
 * Dígito verificador de EAN/GTIN (8, 12, 13 ou 14 dígitos).
 *
 * É o que torna a detecção de coluna confiável: cabeçalho vem escrito de dez
 * jeitos diferentes (`EAN`, `GTIN`, `COD_BARRAS`, `Código`), mas um número que
 * fecha o dígito verificador dificilmente é outra coisa. A chance de uma coluna
 * de valores aleatórios passar é de 1 em 10 por linha — em cinquenta linhas,
 * praticamente zero.
 */
export const eanValido = (valor) => {
  const digitos = String(valor ?? "").replace(/\D/g, "");
  if (![8, 12, 13, 14].includes(digitos.length)) return false;

  const numeros = digitos.split("").map(Number);
  const verificador = numeros.pop();

  // O peso alterna 3 e 1 a partir da direita, qualquer que seja o tamanho.
  const soma = numeros
    .reverse()
    .reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0);

  return (10 - (soma % 10)) % 10 === verificador;
};

/**
 * Converte texto de planilha em número.
 *
 * O nó é `1.234,56` contra `1,234.56`: os dois usam ponto e vírgula, em papéis
 * trocados. A regra que resolve é olhar qual símbolo aparece por último — o
 * separador decimal é sempre o mais à direita.
 */
export const paraNumero = (bruto) => {
  const texto = String(bruto ?? "").trim().replace(/[R$\s]/g, "");
  if (texto === "") return null;

  const ultimaVirgula = texto.lastIndexOf(",");
  const ultimoPonto = texto.lastIndexOf(".");

  let normalizado = texto;
  if (ultimaVirgula > ultimoPonto) {
    normalizado = texto.replace(/\./g, "").replace(",", ".");
  } else if (ultimoPonto > ultimaVirgula) {
    normalizado = texto.replace(/,/g, "");
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
};

/**
 * Devolve o código no formato que valida, ou `null` se nenhum valida.
 *
 * Planilha de ERP costuma trazer o código preenchido com zeros à esquerda até
 * um tamanho fixo do sistema — `0007896094930735` tem 16 dígitos e não é
 * comprimento de EAN nenhum, então validar direto o rejeita. Mas tirar todos os
 * zeros de saída também erra: um UPC-A convertido para EAN-13 começa com zero
 * de verdade, e removê-lo quebra o dígito verificador.
 *
 * Então os zeros saem um a um, e o primeiro formato que fecha o dígito
 * verificador é o certo — é o próprio código que decide onde parar.
 */
export const normalizarEan = (bruto) => {
  let digitos = String(bruto ?? "").replace(/\D/g, "");

  // Oito zeros fecham o dígito verificador de um EAN-8 — a conta passa, o
  // produto não existe. É célula vazia que o ERP gravou como zero.
  if (/^0+$/.test(digitos)) return null;

  while (digitos.length >= 8) {
    if (eanValido(digitos)) return digitos;
    if (!digitos.startsWith("0")) return null;
    digitos = digitos.slice(1);
  }

  return null;
};

/** Notação científica é EAN que o Excel destruiu: `7,89623E+12`. */
export const eanDestruidoPeloExcel = (bruto) =>
  /^\d[,.]?\d*E\+?\d+$/i.test(String(bruto ?? "").trim());

const AMOSTRA = 200;

/**
 * Escolhe a coluna de código de barras pelo conteúdo.
 *
 * O cabeçalho entra só como desempate: ele ajuda quando existe, mas arquivo de
 * ERP tem coluna chamada `CODIGO` que é o código interno, e `COD` que é o de
 * barras — quem decide é o dígito verificador.
 */
const pontuarColunaEan = (valores, titulo) => {
  const preenchidos = valores.filter((v) => String(v ?? "").trim() !== "");
  if (preenchidos.length === 0) return 0;

  // `normalizarEan` e nao `eanValido`: uma coluna que o ERP preencheu com zeros
  // a esquerda ate um tamanho fixo pontuaria zero na validacao direta, e a
  // deteccao escolheria a coluna errada.
  const validos = preenchidos.filter((v) => normalizarEan(v) !== null).length;
  const proporcao = validos / preenchidos.length;

  const nome = String(titulo ?? "").toLowerCase();
  const dica = /ean|gtin|barra|barras/.test(nome) ? 0.15 : 0;

  return proporcao + dica;
};

/**
 * Escolhe a coluna de preço.
 *
 * Uma coluna de preço é numérica, positiva e — o que a separa de quantidade,
 * código e data — costuma ter casas decimais. Quantidade em estoque é inteira;
 * código é inteiro e frequentemente não passa no dígito verificador.
 */
const pontuarColunaPreco = (valores, titulo, indicesEan) => {
  const preenchidos = valores.filter((v) => String(v ?? "").trim() !== "");
  if (preenchidos.length === 0) return 0;

  const numeros = preenchidos.map(paraNumero).filter((n) => n !== null && n > 0);
  if (numeros.length / preenchidos.length < 0.8) return 0;

  const comDecimal = preenchidos.filter((v) => /[,.]\d{1,2}\s*$/.test(String(v))).length;
  const proporcaoDecimal = comDecimal / preenchidos.length;

  const nome = String(titulo ?? "").toLowerCase();
  const dicaPreco = /pre[çc]o|venda|pmc|valor|vlr/.test(nome) ? 0.3 : 0;
  // Custo é numérico e decimal igual a preço de venda; sem esta penalização a
  // detecção troca os dois em arquivo que traz as duas colunas.
  const penalidade = /custo|cmv|compra|entrada/.test(nome) ? -0.5 : 0;

  return proporcaoDecimal * 0.7 + dicaPreco + penalidade + (indicesEan ? -1 : 0);
};

const pontuarColunaCusto = (valores, titulo) => {
  const nome = String(titulo ?? "").toLowerCase();
  if (!/custo|cmv|compra|entrada/.test(nome)) return 0;

  const preenchidos = valores.filter((v) => String(v ?? "").trim() !== "");
  if (preenchidos.length === 0) return 0;

  const numeros = preenchidos.map(paraNumero).filter((n) => n !== null && n > 0);
  return numeros.length / preenchidos.length;
};

/**
 * Devolve o palpite de cada papel de coluna, com a nota que o justificou.
 *
 * A nota volta junto porque a tela mostra o palpite para confirmação. Detectar
 * errado é aceitável; detectar errado em silêncio, não.
 */
export const detectarColunas = ({ cabecalho, linhas }) => {
  const amostra = linhas.slice(0, AMOSTRA);
  const coluna = (i) => amostra.map((l) => l[i]);

  const notasEan = cabecalho.map((titulo, i) => pontuarColunaEan(coluna(i), titulo));
  const melhorEan = notasEan.indexOf(Math.max(...notasEan));
  // Abaixo de 60% de códigos válidos não é coluna de código de barras — é
  // coincidência numérica, e afirmar seria pior que perguntar.
  const ean = notasEan[melhorEan] >= 0.6 ? melhorEan : null;

  const notasPreco = cabecalho.map((titulo, i) =>
    pontuarColunaPreco(coluna(i), titulo, i === ean),
  );
  const melhorPreco = notasPreco.indexOf(Math.max(...notasPreco));
  const preco = notasPreco[melhorPreco] > 0.2 ? melhorPreco : null;

  const notasCusto = cabecalho.map((titulo, i) =>
    i === preco ? 0 : pontuarColunaCusto(coluna(i), titulo),
  );
  const melhorCusto = notasCusto.indexOf(Math.max(...notasCusto));
  const custo = notasCusto[melhorCusto] > 0.7 ? melhorCusto : null;

  const notasDescricao = cabecalho.map((titulo, i) => {
    if (i === ean || i === preco || i === custo) return 0;
    const nome = String(titulo ?? "").toLowerCase();
    const dica = /descri|produto|nome|item/.test(nome) ? 0.5 : 0;
    const textos = coluna(i).filter((v) => /[a-zA-ZÀ-ú]{3}/.test(String(v ?? ""))).length;
    return dica + (textos / Math.max(1, amostra.length)) * 0.5;
  });
  const melhorDescricao = notasDescricao.indexOf(Math.max(...notasDescricao));
  const descricao = notasDescricao[melhorDescricao] > 0.3 ? melhorDescricao : null;

  return {
    ean,
    preco,
    custo,
    descricao,
    confiancaEan: ean !== null ? Math.min(1, notasEan[melhorEan]) : 0,
  };
};

/**
 * Monta a lista final de itens, separando o que não deu para aproveitar.
 *
 * Linha descartada volta com o motivo, e a tela mostra a contagem: um arquivo
 * de 8 mil linhas que vira 200 comparações precisa dizer o que houve com as
 * outras 7.800, senão o silêncio passa por sucesso.
 */
export const montarItens = ({ linhas }, colunas) => {
  const itens = [];
  const descartes = { semEan: 0, eanInvalido: 0, notacaoCientifica: 0, semPreco: 0 };

  linhas.forEach((linha) => {
    const brutoEan = colunas.ean !== null ? linha[colunas.ean] : "";

    if (eanDestruidoPeloExcel(brutoEan)) {
      descartes.notacaoCientifica += 1;
      return;
    }

    if (String(brutoEan ?? "").replace(/\D/g, "") === "") {
      descartes.semEan += 1;
      return;
    }

    const ean = normalizarEan(brutoEan);
    if (ean === null) {
      descartes.eanInvalido += 1;
      return;
    }

    const preco = colunas.preco !== null ? paraNumero(linha[colunas.preco]) : null;
    if (preco === null || preco <= 0) {
      descartes.semPreco += 1;
      return;
    }

    itens.push({
      ean,
      preco,
      custo: colunas.custo !== null ? paraNumero(linha[colunas.custo]) : null,
      descricao: colunas.descricao !== null ? linha[colunas.descricao] : null,
    });
  });

  return { itens, descartes };
};
