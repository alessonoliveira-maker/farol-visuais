/**
 * Capacidade semanal de triagem planejada para o ano inteiro (área, degrau por contratação já
 * aprovada) contra a demanda de entradas de leads, contagem de leads, 52 semanas de 2026-01-05 a
 * 2026-12-28. `demandReal` é medido até 2026-09-14 (semana de hoje); `demandProjected` é a
 * projeção do restante do ano e vem `null` nas semanas já medidas. Dado fictício e fixo.
 */
export interface WeeklyCapacityForecast {
  readonly week: string;
  readonly capacity: number;
  readonly demandReal: number | null;
  readonly demandProjected: number | null;
}

export const asOfWeek = '2026-09-14';

export const data: readonly WeeklyCapacityForecast[] = [
  { week: '2026-01-05', capacity: 40, demandReal: 28, demandProjected: null },
  { week: '2026-01-12', capacity: 40, demandReal: 30, demandProjected: null },
  { week: '2026-01-19', capacity: 40, demandReal: 33, demandProjected: null },
  { week: '2026-01-26', capacity: 40, demandReal: 31, demandProjected: null },
  { week: '2026-02-02', capacity: 40, demandReal: 34, demandProjected: null },
  { week: '2026-02-09', capacity: 40, demandReal: 36, demandProjected: null },
  { week: '2026-02-16', capacity: 40, demandReal: 35, demandProjected: null },
  { week: '2026-02-23', capacity: 40, demandReal: 33, demandProjected: null },
  { week: '2026-03-02', capacity: 40, demandReal: 30, demandProjected: null },
  { week: '2026-03-09', capacity: 40, demandReal: 34, demandProjected: null },
  { week: '2026-03-16', capacity: 40, demandReal: 37, demandProjected: null },
  { week: '2026-03-23', capacity: 40, demandReal: 39, demandProjected: null },
  { week: '2026-03-30', capacity: 40, demandReal: 36, demandProjected: null },
  { week: '2026-04-06', capacity: 48, demandReal: 38, demandProjected: null },
  { week: '2026-04-13', capacity: 48, demandReal: 41, demandProjected: null },
  { week: '2026-04-20', capacity: 48, demandReal: 40, demandProjected: null },
  { week: '2026-04-27', capacity: 48, demandReal: 38, demandProjected: null },
  { week: '2026-05-04', capacity: 48, demandReal: 41, demandProjected: null },
  { week: '2026-05-11', capacity: 48, demandReal: 43, demandProjected: null },
  { week: '2026-05-18', capacity: 48, demandReal: 42, demandProjected: null },
  { week: '2026-05-25', capacity: 48, demandReal: 40, demandProjected: null },
  { week: '2026-06-01', capacity: 48, demandReal: 43, demandProjected: null },
  { week: '2026-06-08', capacity: 48, demandReal: 45, demandProjected: null },
  { week: '2026-06-15', capacity: 48, demandReal: 44, demandProjected: null },
  { week: '2026-06-22', capacity: 48, demandReal: 42, demandProjected: null },
  { week: '2026-06-29', capacity: 48, demandReal: 45, demandProjected: null },
  { week: '2026-07-06', capacity: 52, demandReal: 47, demandProjected: null },
  { week: '2026-07-13', capacity: 52, demandReal: 46, demandProjected: null },
  { week: '2026-07-20', capacity: 52, demandReal: 44, demandProjected: null },
  { week: '2026-07-27', capacity: 52, demandReal: 47, demandProjected: null },
  { week: '2026-08-03', capacity: 52, demandReal: 49, demandProjected: null },
  { week: '2026-08-10', capacity: 52, demandReal: 48, demandProjected: null },
  { week: '2026-08-17', capacity: 52, demandReal: 46, demandProjected: null },
  { week: '2026-08-24', capacity: 52, demandReal: 49, demandProjected: null },
  { week: '2026-08-31', capacity: 52, demandReal: 51, demandProjected: null },
  { week: '2026-09-07', capacity: 52, demandReal: 50, demandProjected: null },
  { week: '2026-09-14', capacity: 52, demandReal: 53, demandProjected: null },
  { week: '2026-09-21', capacity: 52, demandReal: null, demandProjected: 54 },
  { week: '2026-09-28', capacity: 52, demandReal: null, demandProjected: 55 },
  { week: '2026-10-05', capacity: 60, demandReal: null, demandProjected: 57 },
  { week: '2026-10-12', capacity: 60, demandReal: null, demandProjected: 56 },
  { week: '2026-10-19', capacity: 60, demandReal: null, demandProjected: 58 },
  { week: '2026-10-26', capacity: 60, demandReal: null, demandProjected: 59 },
  { week: '2026-11-02', capacity: 60, demandReal: null, demandProjected: 58 },
  { week: '2026-11-09', capacity: 60, demandReal: null, demandProjected: 60 },
  { week: '2026-11-16', capacity: 60, demandReal: null, demandProjected: 61 },
  { week: '2026-11-23', capacity: 60, demandReal: null, demandProjected: 59 },
  { week: '2026-11-30', capacity: 60, demandReal: null, demandProjected: 62 },
  { week: '2026-12-07', capacity: 60, demandReal: null, demandProjected: 63 },
  { week: '2026-12-14', capacity: 60, demandReal: null, demandProjected: 61 },
  { week: '2026-12-21', capacity: 60, demandReal: null, demandProjected: 64 },
  { week: '2026-12-28', capacity: 60, demandReal: null, demandProjected: 65 },
];
