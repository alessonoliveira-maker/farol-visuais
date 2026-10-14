/**
 * Interações com uma página de conteúdo no mês, já agregadas na rede hexagonal do plano de tempo por
 * profundidade de rolagem: cada linha é um hexágono da rede, identificado por coluna e linha, com a
 * contagem de interações que caíram nele. O tempo vai de 0 a 120 segundos e a rolagem de 0 a 100 por
 * cento. Hexágono que não aparece aqui está vazio, e não é hexágono de contagem baixa.
 * O recorte é de propósito extremo: um hexágono sozinho concentra metade das interações, e é essa
 * forma de distribuição que faz a faixa de largura igual deixar de informar.
 * Dado fictício e fixo: interações inventadas, nenhuma pessoa real e nenhum site real.
 */
export interface InteractionHexBin {
  /** Coluna da rede hexagonal, contada da esquerda; linha par tem 9 colunas, ímpar tem 8. */
  readonly col: number;
  /** Linha da rede hexagonal, contada de cima. */
  readonly row: number;
  readonly count: number;
}

export const data: readonly InteractionHexBin[] = [
  { col: 1, row: 0, count: 3 },
  { col: 2, row: 0, count: 5 },
  { col: 3, row: 0, count: 20 },
  { col: 4, row: 0, count: 9 },
  { col: 5, row: 0, count: 3 },
  { col: 7, row: 0, count: 1220 },
  { col: 8, row: 0, count: 383 },
  { col: 1, row: 1, count: 29 },
  { col: 2, row: 1, count: 100 },
  { col: 3, row: 1, count: 241 },
  { col: 4, row: 1, count: 143 },
  { col: 5, row: 1, count: 38 },
  { col: 6, row: 1, count: 624 },
  { col: 7, row: 1, count: 1377 },
  { col: 1, row: 2, count: 23 },
  { col: 2, row: 2, count: 212 },
  { col: 3, row: 2, count: 616 },
  { col: 4, row: 2, count: 696 },
  { col: 5, row: 2, count: 312 },
  { col: 6, row: 2, count: 58 },
  { col: 7, row: 2, count: 288 },
  { col: 8, row: 2, count: 110 },
  { col: 0, row: 3, count: 44 },
  { col: 1, row: 3, count: 143 },
  { col: 2, row: 3, count: 536 },
  { col: 3, row: 3, count: 1037 },
  { col: 4, row: 3, count: 754 },
  { col: 5, row: 3, count: 207 },
  { col: 6, row: 3, count: 18 },
  { col: 0, row: 4, count: 674 },
  { col: 1, row: 4, count: 1066 },
  { col: 2, row: 4, count: 399 },
  { col: 3, row: 4, count: 475 },
  { col: 4, row: 4, count: 565 },
  { col: 5, row: 4, count: 243 },
  { col: 6, row: 4, count: 31 },
  { col: 7, row: 4, count: 3 },
  { col: 0, row: 5, count: 3615 },
  { col: 1, row: 5, count: 2605 },
  { col: 2, row: 5, count: 266 },
  { col: 3, row: 5, count: 121 },
  { col: 4, row: 5, count: 86 },
  { col: 5, row: 5, count: 33 },
  { col: 6, row: 5, count: 3 },
  { col: 0, row: 6, count: 272 },
  { col: 1, row: 6, count: 241 },
  { col: 2, row: 6, count: 38 },
  { col: 3, row: 6, count: 6 },
  { col: 4, row: 6, count: 4 },
  { col: 5, row: 6, count: 5 },
  { col: 0, row: 7, count: 20000 },];

/** O que o total conta e o período, impresso depois do número. */
export const totalCaption = 'interações com a página no mês';
