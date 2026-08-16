/**
 * Cor de cada farmácia no gráfico comparativo.
 *
 * A cor segue a rede, não a colocação: ela vem do `farmacia_id`, então filtrar
 * ou reordenar não repinta ninguém. Se a Panvel é violeta com seis redes na
 * tela, continua violeta com duas.
 *
 * As oito matizes e a ordem estão definidas no index.css (`--serie-1..8`),
 * validadas para daltonismo nos dois temas. A nona farmácia — se um dia
 * existir — cai em cinza de propósito: gerar uma nona cor derrubaria a
 * separação que as oito garantem. Quando isso acontecer, o caminho é agrupar
 * ou facetar, não inventar matiz.
 */
const SLOTS = 8;

export const corDaFarmacia = (farmaciaId) => {
  const id = Number(farmaciaId);
  if (!Number.isInteger(id) || id < 1 || id > SLOTS) return "var(--serie-outra)";
  return `var(--serie-${id})`;
};

/**
 * A API de preços devolve `nome_farmacia`, não `farmacia_id` — o id vem da
 * lista de /api/farmacias. Este índice fecha a ponte.
 */
export const indexarPorNome = (farmacias = []) =>
  farmacias.reduce((mapa, f) => {
    if (f?.nome_farmacia) mapa[f.nome_farmacia] = f.farmacia_id;
    return mapa;
  }, {});
