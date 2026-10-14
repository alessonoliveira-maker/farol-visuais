/**
 * Receita reconhecida por mês, em reais. O último mês tem o período ainda em curso.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenue: number;
  readonly partial: boolean;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2025-10', revenue: 612_400, partial: false },
  { month: '2025-11', revenue: 598_100, partial: false },
  { month: '2025-12', revenue: 741_300, partial: false },
  { month: '2026-01', revenue: 655_900, partial: false },
  { month: '2026-02', revenue: 671_200, partial: false },
  { month: '2026-03', revenue: 702_800, partial: false },
  { month: '2026-04', revenue: 688_500, partial: false },
  { month: '2026-05', revenue: 719_600, partial: false },
  { month: '2026-06', revenue: 745_100, partial: false },
  { month: '2026-07', revenue: 762_300, partial: false },
  { month: '2026-08', revenue: 738_900, partial: false },
  { month: '2026-09', revenue: 411_200, partial: true },
];

/** Data de corte do mês em curso, usada na nota de parcial. */
export const partialAsOf = '2026-09-14';
