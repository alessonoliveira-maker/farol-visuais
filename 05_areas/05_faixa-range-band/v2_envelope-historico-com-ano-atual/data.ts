/**
 * Entradas semanais de lead em 2026 contra o envelope histórico da mesma semana do calendário.
 * `minHistorical` e `maxHistorical` são o mínimo e o máximo medidos na mesma semana em 2023,
 * 2024 e 2025 (3 anos, 3 observações por semana), não percentil nem intervalo de confiança.
 * `current` é a entrada medida em 2026; a última semana está parcial, coletada até
 * `partialAsOf`, e ganha a marca `partial`. Dado fictício e fixo, semanas 1 a 18 de 2026.
 */
export interface WeeklyEnvelope {
  readonly week: string;
  readonly weekNumber: number;
  readonly minHistorical: number;
  readonly maxHistorical: number;
  readonly current: number;
  readonly partial?: boolean;
}

export const partialAsOf = '2026-05-04';

export const data: readonly WeeklyEnvelope[] = [
  { week: '2026-01-05', weekNumber: 1, minHistorical: 62, maxHistorical: 118, current: 88 },
  { week: '2026-01-12', weekNumber: 2, minHistorical: 58, maxHistorical: 112, current: 84 },
  { week: '2026-01-19', weekNumber: 3, minHistorical: 65, maxHistorical: 121, current: 95 },
  { week: '2026-01-26', weekNumber: 4, minHistorical: 70, maxHistorical: 128, current: 101 },
  { week: '2026-02-02', weekNumber: 5, minHistorical: 68, maxHistorical: 124, current: 118 },
  { week: '2026-02-09', weekNumber: 6, minHistorical: 72, maxHistorical: 130, current: 96 },
  { week: '2026-02-16', weekNumber: 7, minHistorical: 75, maxHistorical: 134, current: 90 },
  { week: '2026-02-23', weekNumber: 8, minHistorical: 66, maxHistorical: 120, current: 138 },
  { week: '2026-03-02', weekNumber: 9, minHistorical: 60, maxHistorical: 116, current: 102 },
  { week: '2026-03-09', weekNumber: 10, minHistorical: 64, maxHistorical: 122, current: 58 },
  { week: '2026-03-16', weekNumber: 11, minHistorical: 69, maxHistorical: 126, current: 110 },
  { week: '2026-03-23', weekNumber: 12, minHistorical: 73, maxHistorical: 132, current: 128 },
  { week: '2026-03-30', weekNumber: 13, minHistorical: 77, maxHistorical: 138, current: 133 },
  { week: '2026-04-06', weekNumber: 14, minHistorical: 80, maxHistorical: 142, current: 121 },
  { week: '2026-04-13', weekNumber: 15, minHistorical: 74, maxHistorical: 136, current: 145 },
  { week: '2026-04-20', weekNumber: 16, minHistorical: 71, maxHistorical: 129, current: 118 },
  { week: '2026-04-27', weekNumber: 17, minHistorical: 68, maxHistorical: 124, current: 112 },
  { week: '2026-05-04', weekNumber: 18, minHistorical: 66, maxHistorical: 120, current: 54, partial: true },
];
