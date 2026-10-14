/**
 * Entradas diárias de leads no funil de pré-vendas em 26 semanas, a partir da semana de 2026-03-02:
 * o menor e o maior número de entradas num único dia de cada semana, e quantos dias tiveram coleta.
 * Dado fictício e fixo. Casos difíceis: uma semana sem nenhuma coleta (min e max nulos, nunca zero),
 * uma semana com um só dia coletado (faixa nula, min igual a max), semanas em que o pico passa da
 * capacidade diária e um começo de série que fica abaixo dela.
 */
export interface WeeklyEntryRange {
  readonly id: string;
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly week: string;
  /** Menor número de entradas num dia da semana, ou `null` quando a semana não teve coleta. */
  readonly min: number | null;
  /** Maior número de entradas num dia da semana, ou `null` quando a semana não teve coleta. */
  readonly max: number | null;
  /** Dias da semana com coleta. */
  readonly days: number;
}

/** Capacidade diária de entradas que o time absorve, em leads por dia. */
export const dailyCapacity = 48;

export const data: readonly WeeklyEntryRange[] = [
  { id: 'sem-01', week: '2026-03-02', min: 14, max: 38, days: 5 },
  { id: 'sem-02', week: '2026-03-09', min: 16, max: 41, days: 5 },
  { id: 'sem-03', week: '2026-03-16', min: 12, max: 36, days: 5 },
  { id: 'sem-04', week: '2026-03-23', min: 18, max: 42, days: 5 },
  { id: 'sem-05', week: '2026-03-30', min: 15, max: 44, days: 5 },
  { id: 'sem-06', week: '2026-04-06', min: 20, max: 43, days: 5 },
  { id: 'sem-07', week: '2026-04-13', min: 17, max: 47, days: 5 },
  { id: 'sem-08', week: '2026-04-20', min: 22, max: 51, days: 5 },
  { id: 'sem-09', week: '2026-04-27', min: 19, max: 46, days: 5 },
  { id: 'sem-10', week: '2026-05-04', min: 24, max: 55, days: 5 },
  { id: 'sem-11', week: '2026-05-11', min: 21, max: 49, days: 5 },
  { id: 'sem-12', week: '2026-05-18', min: 26, max: 58, days: 5 },
  { id: 'sem-13', week: '2026-05-25', min: 23, max: 52, days: 5 },
  { id: 'sem-14', week: '2026-06-01', min: 18, max: 45, days: 5 },
  { id: 'sem-15', week: '2026-06-08', min: 20, max: 42, days: 5 },
  { id: 'sem-16', week: '2026-06-15', min: 16, max: 39, days: 5 },
  { id: 'sem-17', week: '2026-06-22', min: null, max: null, days: 0 },
  { id: 'sem-18', week: '2026-06-29', min: 22, max: 22, days: 1 },
  { id: 'sem-19', week: '2026-07-06', min: 19, max: 40, days: 5 },
  { id: 'sem-20', week: '2026-07-13', min: 25, max: 47, days: 5 },
  { id: 'sem-21', week: '2026-07-20', min: 28, max: 53, days: 5 },
  { id: 'sem-22', week: '2026-07-27', min: 24, max: 50, days: 5 },
  { id: 'sem-23', week: '2026-08-03', min: 21, max: 44, days: 5 },
  { id: 'sem-24', week: '2026-08-10', min: 17, max: 41, days: 5 },
  { id: 'sem-25', week: '2026-08-17', min: 23, max: 46, days: 5 },
  { id: 'sem-26', week: '2026-08-24', min: 26, max: 49, days: 5 },
];
