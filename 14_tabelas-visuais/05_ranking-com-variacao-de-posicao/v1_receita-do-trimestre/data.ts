/**
 * Ranking de receita reconhecida por executivo em 2026-T3 contra 2026-T2, em reais.
 * `pos` e `posAnterior` são a posição no ranking em cada trimestre (1 é o líder); `value` e
 * `valueAnterior` são a receita de cada período. Todos os oito já estavam no ranking no
 * trimestre anterior (nenhuma entrada nem saída nesta versão; ver v2 para esse caso).
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface RankingRow {
  readonly id: string;
  readonly name: string;
  readonly pos: number;
  readonly posAnterior: number;
  readonly value: number;
  readonly valueAnterior: number;
}

export const periodoAtual = '2026-T3';
export const periodoAnterior = '2026-T2';

// posAnterior é a posição de cada executivo em 2026-T2, derivada da ordenação de `valueAnterior`
// (maior receita primeiro): Murilo 486,9 mil = 1º, Talita 401,25 mil = 2º, Renan 312,4 mil = 3º,
// Lorena 264,8 mil = 4º, Ingrid 229,3 mil = 5º, Priscila 198,7 mil = 6º, Otavio 151,7 mil = 7º,
// Heitor 143,6 mil = 8º. Nunca declarar posAnterior sem recalcular a partir de valueAnterior.
export const data: readonly RankingRow[] = [
  { id: 'exec-talita', name: 'Talita V.', pos: 1, posAnterior: 2, value: 486_900, valueAnterior: 401_250 },
  { id: 'exec-murilo', name: 'Murilo C.', pos: 2, posAnterior: 1, value: 452_300, valueAnterior: 486_900 },
  { id: 'exec-renan', name: 'Renan A.', pos: 3, posAnterior: 3, value: 401_250, valueAnterior: 312_400 },
  { id: 'exec-ingrid', name: 'Ingrid S.', pos: 4, posAnterior: 5, value: 312_400, valueAnterior: 229_300 },
  { id: 'exec-lorena', name: 'Lorena B.', pos: 5, posAnterior: 4, value: 264_800, valueAnterior: 264_800 },
  { id: 'exec-priscila', name: 'Priscila T.', pos: 6, posAnterior: 6, value: 229_300, valueAnterior: 198_700 },
  { id: 'exec-heitor', name: 'Heitor Wanderley M.', pos: 7, posAnterior: 8, value: 143_600, valueAnterior: 143_600 },
  { id: 'exec-otavio', name: 'Otavio R.', pos: 8, posAnterior: 7, value: 97_450, valueAnterior: 151_700 },
];
