/**
 * Agendas marcadas por semana, por SDR, nas mesmas 12 semanas para todas as linhas. Dado fictício
 * e fixo. `value: null` é semana sem carga de dado (lacuna individual, não é zero). A semana de
 * índice 5 (2026-08-03) é recesso da equipe inteira, comum a todas as linhas. `admittedFromWeek`
 * marca a primeira semana em que o SDR já existia; semanas antes dela não têm ponto nenhum.
 */
export interface WeeklyPointOrGap {
  readonly week: string;
  readonly value: number | null;
}

export interface SdrWeeklyAgendaGap {
  readonly id: string;
  readonly name: string;
  readonly series: readonly WeeklyPointOrGap[];
  /** Índice (0 a 11) da primeira semana com o SDR já contratado; undefined é "desde o início". */
  readonly admittedFromWeek?: number;
}

const WEEKS = [
  '2026-06-29', '2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27', '2026-08-03',
  '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14',
] as const;

/** Semana de índice 5 (2026-08-03): recesso da equipe inteira, comum a todas as linhas. */
export const recessWeekIndex = 5;

function series(values: readonly (number | null)[]): readonly WeeklyPointOrGap[] {
  return WEEKS.map((week, i) => ({ week, value: values[i] ?? null }));
}

export const data: readonly SdrWeeklyAgendaGap[] = [
  { id: 'camila', name: 'Camila F.', series: series([14, 16, 15, 17, 18, null, 19, 20, 18, null, 22, 23]) },
  {
    id: 'rafael',
    name: 'Rafael N.',
    series: series([null, null, null, null, null, null, null, 10, 12, 13, 15, 16]),
    admittedFromWeek: 7,
  },
  { id: 'otavio', name: 'Otávio B.', series: series([14, 15, 13, 16, 18, null, 17, 19, null, null, 21, 22]) },
  { id: 'juliana', name: 'Juliana P.', series: series([20, 19, 21, 22, 23, null, 24, 23, 25, 26, 24, 27]) },
  { id: 'marcos', name: 'Marcos T.', series: series([16, 14, 17, 15, 16, null, 18, 17, 19, 18, 20, 19]) },
];
