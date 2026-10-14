/**
 * Receita reconhecida e meta mensal de 2026, em reais.
 * Dado fictício e fixo: nenhum valor vem de cliente ou operação real.
 */
export interface MonthlyRevenueVsTarget {
  readonly month: string;
  readonly revenue: number;
  readonly target: number;
}

export const data: readonly MonthlyRevenueVsTarget[] = [
  { month: '2026-01', revenue: 612_000, target: 650_000 },
  { month: '2026-02', revenue: 583_400, target: 650_000 },
  { month: '2026-03', revenue: 701_200, target: 650_000 },
  { month: '2026-04', revenue: 288_900, target: 650_000 },
  { month: '2026-05', revenue: 742_600, target: 660_000 },
  { month: '2026-06', revenue: 658_300, target: 660_000 },
  { month: '2026-07', revenue: 815_000, target: 670_000 },
  { month: '2026-08', revenue: 693_450, target: 670_000 },
  { month: '2026-09', revenue: 621_800, target: 680_000 },
  { month: '2026-10', revenue: 758_900, target: 680_000 },
  { month: '2026-11', revenue: 802_300, target: 690_000 },
  { month: '2026-12', revenue: 941_700, target: 700_000 },
];
