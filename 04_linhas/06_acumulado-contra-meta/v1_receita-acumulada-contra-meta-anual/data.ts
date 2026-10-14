/**
 * Receita reconhecida mensal de 2026, em reais, de janeiro a agosto.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real. Os dois últimos meses ainda não
 * fecharam e entram como `null`, nunca repetindo o valor de junho.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenueRecognized: number | null;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenueRecognized: 612_000 },
  { month: '2026-02', revenueRecognized: 584_000 },
  { month: '2026-03', revenueRecognized: 701_500 },
  { month: '2026-04', revenueRecognized: 668_000 },
  { month: '2026-05', revenueRecognized: 743_000 },
  { month: '2026-06', revenueRecognized: 812_000 },
  { month: '2026-07', revenueRecognized: null },
  { month: '2026-08', revenueRecognized: null },
];

/** Meta anual de faturamento reconhecido, dividida em doze meses para a trajetória linear. */
export const annualTarget = 10_000_000;
