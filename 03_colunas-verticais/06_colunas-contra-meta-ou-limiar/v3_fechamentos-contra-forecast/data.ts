/**
 * Fechamentos por mês, em reais, contra o forecast declarado no início de cada mês.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface MonthlyClosing {
  readonly month: string;
  readonly forecast: number;
  readonly closed: number;
}

export const data: readonly MonthlyClosing[] = [
  { month: '2026-03', forecast: 450_000, closed: 455_000 },
  { month: '2026-04', forecast: 460_000, closed: 402_000 },
  { month: '2026-05', forecast: 480_000, closed: 480_000 },
  { month: '2026-06', forecast: 500_000, closed: 610_000 },
  { month: '2026-07', forecast: 510_000, closed: 498_000 },
  { month: '2026-08', forecast: 530_000, closed: 522_000 },
];
