/**
 * Receita reconhecida por mês, em reais, contra a meta mensal fixa da área comercial.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenue: number;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-04', revenue: 559_600 },
  { month: '2026-05', revenue: 631_700 },
  { month: '2026-06', revenue: 648_200 },
  { month: '2026-07', revenue: 602_000 },
  { month: '2026-08', revenue: 617_900 },
  { month: '2026-09', revenue: 573_400 },
];

/** Meta mensal fixa da área comercial no período. */
export const goal = 600_000;
