/**
 * Ranking do ciclo médio de venda por executivo em 2026-09 contra 2026-08, em dias corridos.
 * Menor é melhor: quem reduz o ciclo sobe no ranking. Duas posições podem empatar (mesmo valor
 * de dias), caso em que a competição padrão repete o número da posição (rótulo "4=") e a
 * próxima posição pula o número saltado. Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface RankingRow {
  readonly id: string;
  readonly name: string;
  readonly pos: number;
  readonly posAnterior: number;
  readonly value: number;
  readonly valueAnterior: number;
}

/** Para onde aponta o "bom": aqui é reduzir o ciclo, não aumentar. */
export const goodDirection: 'up' | 'down' = 'down';
export const mesAtual = '2026-09';
export const mesAnterior = '2026-08';

export const data: readonly RankingRow[] = [
  { id: 'exec-fabiana', name: 'Fabiana R.', pos: 1, posAnterior: 1, value: 28, valueAnterior: 30 },
  { id: 'exec-bruno', name: 'Bruno T.', pos: 2, posAnterior: 3, value: 34, valueAnterior: 41 },
  { id: 'exec-diego', name: 'Diego P.', pos: 3, posAnterior: 5, value: 39, valueAnterior: 48 },
  { id: 'exec-rafaela', name: 'Rafaela Nascimento P.', pos: 4, posAnterior: 4, value: 44, valueAnterior: 44 },
  { id: 'exec-ingrid', name: 'Ingrid S.', pos: 4, posAnterior: 6, value: 44, valueAnterior: 50 },
  { id: 'exec-otavio', name: 'Otavio R.', pos: 6, posAnterior: 2, value: 52, valueAnterior: 34 },
];
