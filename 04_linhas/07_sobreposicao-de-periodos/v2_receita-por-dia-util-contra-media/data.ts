/**
 * Receita reconhecida acumulada por dia útil do mês, em reais.
 * "current" é 2026-09, medido até o 9º dia útil (hoje); os dias seguintes ainda não aconteceram.
 * "sixMonthAverage" é a média já calculada da mesma acumulação em cada dia útil dos 6 meses
 * anteriores (2026-03 a 2026-08), cobrindo os 22 dias úteis do mês mais longo do grupo.
 * Dado fictício e fixo.
 */
export interface BusinessDayRevenue {
  readonly businessDay: number;
  readonly current: number | null;
  readonly sixMonthAverage: number;
}

export const data: readonly BusinessDayRevenue[] = [
  { businessDay: 1, current: 41_000, sixMonthAverage: 38_000 },
  { businessDay: 2, current: 86_000, sixMonthAverage: 79_000 },
  { businessDay: 3, current: 131_000, sixMonthAverage: 121_000 },
  { businessDay: 4, current: 178_000, sixMonthAverage: 165_000 },
  { businessDay: 5, current: 227_000, sixMonthAverage: 210_000 },
  { businessDay: 6, current: 277_000, sixMonthAverage: 256_000 },
  { businessDay: 7, current: 328_000, sixMonthAverage: 303_000 },
  { businessDay: 8, current: 380_000, sixMonthAverage: 351_000 },
  { businessDay: 9, current: 432_000, sixMonthAverage: 399_000 },
  { businessDay: 10, current: null, sixMonthAverage: 448_000 },
  { businessDay: 11, current: null, sixMonthAverage: 497_000 },
  { businessDay: 12, current: null, sixMonthAverage: 547_000 },
  { businessDay: 13, current: null, sixMonthAverage: 597_000 },
  { businessDay: 14, current: null, sixMonthAverage: 647_000 },
  { businessDay: 15, current: null, sixMonthAverage: 697_000 },
  { businessDay: 16, current: null, sixMonthAverage: 747_000 },
  { businessDay: 17, current: null, sixMonthAverage: 797_000 },
  { businessDay: 18, current: null, sixMonthAverage: 847_000 },
  { businessDay: 19, current: null, sixMonthAverage: 897_000 },
  { businessDay: 20, current: null, sixMonthAverage: 947_000 },
  { businessDay: 21, current: null, sixMonthAverage: 997_000 },
  { businessDay: 22, current: null, sixMonthAverage: 1_047_000 },
];
