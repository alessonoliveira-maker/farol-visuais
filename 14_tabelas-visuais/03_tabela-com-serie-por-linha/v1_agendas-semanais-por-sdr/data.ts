/**
 * Agendas marcadas por semana, por SDR, nas últimas 12 semanas. Dado fictício e fixo, em número de
 * agendas (contagem inteira). As semanas vão do mais antigo (índice 0) ao mais recente.
 */
export interface WeeklyPoint {
  readonly week: string;
  readonly value: number;
}

export interface SdrWeeklyAgenda {
  readonly id: string;
  readonly name: string;
  readonly series: readonly WeeklyPoint[];
}

const WEEKS = [
  '2026-06-29', '2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27', '2026-08-03',
  '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14',
] as const;

function series(values: readonly number[]): readonly WeeklyPoint[] {
  return WEEKS.map((week, i) => ({ week, value: values[i] ?? 0 }));
}

export const data: readonly SdrWeeklyAgenda[] = [
  { id: 'talita', name: 'Talita M.', series: series([14, 16, 15, 18, 17, 19, 21, 20, 22, 24, 23, 25]) },
  { id: 'renan', name: 'Renan A.', series: series([22, 20, 23, 19, 21, 18, 20, 17, 19, 16, 18, 15]) },
  { id: 'bernardo', name: 'Bernardo S.', series: series([12, 18, 10, 20, 14, 22, 11, 19, 13, 21, 15, 20]) },
  { id: 'camila', name: 'Camila F.', series: series([18, 18, 17, 18, 19, 18, 17, 18, 19, 18, 17, 18]) },
  { id: 'diego', name: 'Diego P.', series: series([9, 10, 8, 11, 9, 10, 9, 12, 10, 11, 9, 10]) },
  { id: 'fernanda', name: 'Fernanda R.', series: series([20, 19, 21, 22, 20, 23, 21, 24, 22, 25, 23, 26]) },
  { id: 'gustavo', name: 'Gustavo L.', series: series([16, 15, 17, 14, 16, 13, 15, 12, 14, 11, 13, 10]) },
  { id: 'maria-eduarda', name: 'Maria Eduarda C.', series: series([24, 23, 25, 22, 26, 21, 27, 20, 28, 19, 29, 18]) },
  { id: 'igor', name: 'Igor N.', series: series([13, 14, 13, 15, 14, 16, 15, 17, 16, 18, 17, 19]) },
];
