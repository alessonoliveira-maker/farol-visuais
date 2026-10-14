/**
 * Receita reconhecida mensal contra a meta mensal (que sobe ao longo do ano) de uma unidade de
 * negócio fictícia, em reais. A receita começa bem abaixo da meta, cruza de lado por três vezes
 * seguidas antes de assentar acima dela; o desvio (35 a 80 mil) é grande o bastante para o corpo
 * do gráfico mostrar a faixa, não só a linha. Dado fictício e fixo.
 */
export interface MonthlyRevenueVsTarget {
  readonly month: string;
  readonly revenue: number;
  readonly target: number;
}

export const data: readonly MonthlyRevenueVsTarget[] = [
  { month: '2026-01', revenue: 300_000, target: 380_000 },
  { month: '2026-02', revenue: 330_000, target: 385_000 },
  { month: '2026-03', revenue: 345_000, target: 390_000 },
  { month: '2026-04', revenue: 430_000, target: 395_000 },
  { month: '2026-05', revenue: 365_000, target: 400_000 },
  { month: '2026-06', revenue: 445_000, target: 405_000 },
  { month: '2026-07', revenue: 460_000, target: 410_000 },
  { month: '2026-08', revenue: 470_000, target: 420_000 },
  { month: '2026-09', revenue: 490_000, target: 430_000 },
  { month: '2026-10', revenue: 495_000, target: 440_000 },
  { month: '2026-11', revenue: 520_000, target: 450_000 },
  { month: '2026-12', revenue: 540_000, target: 460_000 },
];
