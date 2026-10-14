/**
 * Investimento em mídia, leads e agendas por mês, valores absolutos, de 2026-01 a 2026-08.
 * Dado fictício e fixo. Leads não tem medição em 2026-01 (integração começou em fevereiro),
 * por isso vem `null`: o índice dessa série nasce em 2026-02.
 */
export interface MonthlyFunnelRaw {
  readonly month: string;
  readonly investimento: number;
  readonly leads: number | null;
  readonly agendas: number;
}

export const data: readonly MonthlyFunnelRaw[] = [
  { month: '2026-01', investimento: 33_400, leads: null, agendas: 96 },
  { month: '2026-02', investimento: 36_800, leads: 452, agendas: 99 },
  { month: '2026-03', investimento: 40_200, leads: 480, agendas: 102 },
  { month: '2026-04', investimento: 44_500, leads: 512, agendas: 104 },
  { month: '2026-05', investimento: 48_900, leads: 545, agendas: 108 },
  { month: '2026-06', investimento: 53_200, leads: 570, agendas: 110 },
  { month: '2026-07', investimento: 57_100, leads: 598, agendas: 114 },
  { month: '2026-08', investimento: 61_000, leads: 620, agendas: 118 },
];
