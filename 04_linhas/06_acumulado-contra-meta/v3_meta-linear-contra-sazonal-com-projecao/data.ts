/**
 * Receita reconhecida mensal, em reais: o ano anterior inteiro (2025, para derivar o peso
 * sazonal) e 2026 de janeiro a agosto, com setembro a dezembro ainda por vir (`null`).
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface PriorYearMonth {
  readonly month: string;
  readonly revenue: number;
}

export interface MonthlyRevenue {
  readonly month: string;
  readonly revenueRecognized: number | null;
}

export const priorYear: readonly PriorYearMonth[] = [
  { month: '2025-01', revenue: 550_000 },
  { month: '2025-02', revenue: 520_000 },
  { month: '2025-03', revenue: 610_000 },
  { month: '2025-04', revenue: 590_000 },
  { month: '2025-05', revenue: 630_000 },
  { month: '2025-06', revenue: 680_000 },
  { month: '2025-07', revenue: 660_000 },
  { month: '2025-08', revenue: 700_000 },
  { month: '2025-09', revenue: 740_000 },
  { month: '2025-10', revenue: 820_000 },
  { month: '2025-11', revenue: 900_000 },
  { month: '2025-12', revenue: 1_300_000 },
];

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenueRecognized: 590_000 },
  { month: '2026-02', revenueRecognized: 565_000 },
  { month: '2026-03', revenueRecognized: 655_000 },
  { month: '2026-04', revenueRecognized: 635_000 },
  { month: '2026-05', revenueRecognized: 675_000 },
  { month: '2026-06', revenueRecognized: 730_000 },
  { month: '2026-07', revenueRecognized: 705_000 },
  { month: '2026-08', revenueRecognized: 745_000 },
  { month: '2026-09', revenueRecognized: null },
  { month: '2026-10', revenueRecognized: null },
  { month: '2026-11', revenueRecognized: null },
  { month: '2026-12', revenueRecognized: null },
];

/** Meta anual, a mesma dividida pela trajetória linear ou pela sazonal. */
export const annualTarget = 10_000_000;
