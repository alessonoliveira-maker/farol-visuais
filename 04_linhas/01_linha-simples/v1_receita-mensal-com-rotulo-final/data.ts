/**
 * Receita reconhecida mensal, em reais, de janeiro a agosto de 2026.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenue: number | null;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenue: 612_400 },
  { month: '2026-02', revenue: 598_900 },
  { month: '2026-03', revenue: 674_300 },
  { month: '2026-04', revenue: 705_100 },
  { month: '2026-05', revenue: 641_800 },
  { month: '2026-06', revenue: 733_600 },
  { month: '2026-07', revenue: 789_200 },
  { month: '2026-08', revenue: 842_500 },
];
