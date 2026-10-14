/**
 * Ranking de receita reconhecida de 6 executivos em 2026-08 contra 2026-07, com a posição nos
 * últimos 6 meses (2026-03 a 2026-08, 1 é o topo). `positions` é uma tupla de 6 posições; a
 * posição atual é o último item e a anterior é o penúltimo. Dado fictício e fixo: nenhum nome é
 * pessoa real.
 */
export type PositionSeries = readonly [number, number, number, number, number, number];

export interface RankingRow {
  readonly id: string;
  readonly name: string;
  readonly positions: PositionSeries;
  readonly value: number;
  readonly valueAnterior: number;
}

export const mesAtual = '2026-08';
export const mesAnterior = '2026-07';

export const data: readonly RankingRow[] = [
  { id: 'exec-bianca', name: 'Bianca F.', positions: [3, 2, 2, 3, 2, 1], value: 486_900, valueAnterior: 452_300 },
  { id: 'exec-rodrigo', name: 'Rodrigo P.', positions: [2, 1, 1, 2, 1, 2], value: 452_300, valueAnterior: 486_900 },
  { id: 'exec-camila', name: 'Camila D.', positions: [4, 5, 4, 5, 4, 3], value: 401_250, valueAnterior: 312_400 },
  { id: 'exec-diego', name: 'Diego A.', positions: [3, 2, 3, 2, 3, 4], value: 312_400, valueAnterior: 401_250 },
  { id: 'exec-fernanda', name: 'Fernanda L.', positions: [6, 5, 6, 5, 6, 5], value: 264_800, valueAnterior: 229_300 },
  { id: 'exec-vinicius', name: 'Vinicius T.', positions: [5, 6, 5, 6, 5, 6], value: 229_300, valueAnterior: 264_800 },
];

/** Executivo em destaque por padrão: subiu no ranking e na receita no mesmo mês. */
export const highlightId = 'exec-camila';
