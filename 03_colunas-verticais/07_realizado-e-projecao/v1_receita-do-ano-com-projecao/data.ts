/**
 * Receita reconhecida por mês do ano corrente, em reais. Os 8 primeiros meses estão fechados
 * (regime "realizado"); os 4 últimos ainda não aconteceram e entram como projeção (regime
 * "projecao"), calculada por média móvel dos meses fechados mais recentes. Dado fictício e
 * fixo: nenhuma pessoa ou empresa real é citada.
 */
export interface MonthlyRevenueRegime {
  readonly month: string;
  readonly revenue: number;
  readonly regime: 'realizado' | 'projecao';
}

export const data: readonly MonthlyRevenueRegime[] = [
  { month: '2026-01', revenue: 520_000, regime: 'realizado' },
  { month: '2026-02', revenue: 610_000, regime: 'realizado' },
  { month: '2026-03', revenue: 480_000, regime: 'realizado' },
  { month: '2026-04', revenue: 705_000, regime: 'realizado' },
  { month: '2026-05', revenue: 640_000, regime: 'realizado' },
  { month: '2026-06', revenue: 760_000, regime: 'realizado' },
  { month: '2026-07', revenue: 820_000, regime: 'realizado' },
  { month: '2026-08', revenue: 690_000, regime: 'realizado' },
  { month: '2026-09', revenue: 705_000, regime: 'projecao' },
  { month: '2026-10', revenue: 730_000, regime: 'projecao' },
  { month: '2026-11', revenue: 690_000, regime: 'projecao' },
  { month: '2026-12', revenue: 810_000, regime: 'projecao' },
];
