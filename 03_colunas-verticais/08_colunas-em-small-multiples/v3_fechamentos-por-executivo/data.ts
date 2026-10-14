/**
 * Fechamentos por mês de 12 executivos, de 2026-03 a 2026-08, mais o total de negócios
 * trabalhados e ganhos no mesmo período (para o win rate). Dado fictício e fixo: nomes com
 * inicial de sobrenome, nenhuma pessoa real.
 */
export interface MonthlyCloses {
  readonly month: string;
  readonly value: number;
}

export interface ExecutiveCloses {
  readonly id: string;
  readonly name: string;
  readonly monthly: readonly MonthlyCloses[];
  readonly deals: number;
  readonly wins: number;
}

const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'] as const;

function series(values: readonly number[]): readonly MonthlyCloses[] {
  return MONTHS.map((month, index) => ({ month, value: values[index] ?? 0 }));
}

/** Ordem de entrada arbitrária: o componente ordena por win rate. */
export const data: readonly ExecutiveCloses[] = [
  { id: 'exec-marina', name: 'Marina T.', monthly: series([3, 4, 5, 4, 4, 4]), deals: 40, wins: 24 },
  { id: 'exec-rafael', name: 'Rafael P.', monthly: series([2, 3, 3, 4, 3, 3]), deals: 36, wins: 18 },
  { id: 'exec-camila', name: 'Camila S.', monthly: series([3, 3, 4, 3, 4, 3]), deals: 44, wins: 20 },
  { id: 'exec-bruno', name: 'Bruno A.', monthly: series([2, 3, 2, 3, 3, 2]), deals: 34, wins: 15 },
  { id: 'exec-juliana', name: 'Juliana M.', monthly: series([2, 2, 3, 2, 3, 2]), deals: 32, wins: 14 },
  { id: 'exec-diego', name: 'Diego F.', monthly: series([3, 2, 3, 3, 2, 3]), deals: 38, wins: 16 },
  { id: 'exec-patricia', name: 'Patricia L.', monthly: series([2, 2, 2, 2, 2, 2]), deals: 30, wins: 12 },
  { id: 'exec-eduardo', name: 'Eduardo N.', monthly: series([2, 1, 2, 2, 2, 2]), deals: 29, wins: 11 },
  { id: 'exec-carla', name: 'Carla V.', monthly: series([1, 2, 1, 2, 2, 1]), deals: 27, wins: 9 },
  { id: 'exec-thiago', name: 'Thiago R.', monthly: series([1, 1, 2, 1, 2, 1]), deals: 29, wins: 8 },
  { id: 'exec-fernanda', name: 'Fernanda B.', monthly: series([1, 1, 1, 1, 1, 1]), deals: 28, wins: 6 },
  { id: 'exec-vinicius', name: 'Vinícius D.', monthly: series([1, 0, 1, 1, 0, 1]), deals: 26, wins: 4 },
];

/** Piso esperado de win rate: abaixo dele o painel recebe o aviso. */
export const winRateFloor = 0.35;
