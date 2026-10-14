/**
 * Custo mensal realizado contra o orçado, em reais, para os 12 meses de 2026.
 * Dado fictício e fixo: nenhum valor vem de sistema real.
 */
export interface MonthlyCostVsBudget {
  readonly month: string;
  readonly realizado: number;
  readonly orcado: number;
}

export const data: readonly MonthlyCostVsBudget[] = [
  { month: '2026-01', realizado: 412_000, orcado: 400_000 },
  { month: '2026-02', realizado: 398_500, orcado: 400_000 },
  { month: '2026-03', realizado: 455_000, orcado: 410_000 },
  { month: '2026-04', realizado: 405_000, orcado: 420_000 },
  { month: '2026-05', realizado: 512_000, orcado: 430_000 },
  { month: '2026-06', realizado: 418_000, orcado: 440_000 },
  { month: '2026-07', realizado: 447_000, orcado: 450_000 },
  { month: '2026-08', realizado: 468_000, orcado: 460_000 },
  { month: '2026-09', realizado: 471_000, orcado: 470_000 },
  { month: '2026-10', realizado: 452_000, orcado: 480_000 },
  { month: '2026-11', realizado: 561_000, orcado: 490_000 },
  { month: '2026-12', realizado: 498_000, orcado: 500_000 },
];
