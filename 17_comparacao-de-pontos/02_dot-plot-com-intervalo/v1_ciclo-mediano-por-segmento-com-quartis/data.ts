/**
 * Ciclo de venda dos negócios ganhos por segmento, em dias corridos: a mediana, o primeiro e o
 * terceiro quartil (interpolação linear) e o número de negócios que sustenta cada resumo. Dado
 * fictício e fixo. Serviços financeiros tem cauda longa para a direita (faixa assimétrica) e
 * Saúde e bem-estar tem faixa estreita, com as duas serifas quase coladas no ponto.
 */
export interface SegmentCycle {
  readonly id: string;
  readonly name: string;
  readonly deals: number;
  readonly median: number;
  readonly q1: number;
  readonly q3: number;
}

export const data: readonly SegmentCycle[] = [
  { id: 'seg-industria', name: 'Indústria', deals: 48, median: 41, q1: 29, q3: 63 },
  { id: 'seg-varejo', name: 'Varejo e distribuição', deals: 62, median: 24, q1: 17, q3: 33 },
  { id: 'seg-financeiro', name: 'Serviços financeiros', deals: 31, median: 57, q1: 38, q3: 78 },
  { id: 'seg-saude', name: 'Saúde e bem-estar', deals: 27, median: 33, q1: 31, q3: 36 },
  { id: 'seg-tecnologia', name: 'Tecnologia', deals: 54, median: 19, q1: 12, q3: 31 },
];
