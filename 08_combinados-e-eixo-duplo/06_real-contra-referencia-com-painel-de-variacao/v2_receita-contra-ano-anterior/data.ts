/**
 * Receita mensal de 2026 contra o mesmo mês de 2025, em reais, nos 12 meses do ano.
 * Dado fictício e fixo: nenhum valor vem de sistema real.
 *
 * `baseAnterior` é a receita do mesmo mês de 2025, que é a referência da comparação.
 * Fevereiro traz base de R$ 18 mil de propósito: é o mês em que a linha nasceu, e uma base
 * dessas ordem de grandeza torna o percentual de variação ilegível, que é o caso-limite que
 * esta versão existe para mostrar.
 */
export interface MonthlyRevenueVsLastYear {
  readonly month: string;
  /** Mês equivalente de 2025, em texto `YYYY-MM`, para a variação nomear a base. */
  readonly baseMonth: string;
  readonly realizado: number;
  readonly baseAnterior: number;
}

export const data: readonly MonthlyRevenueVsLastYear[] = [
  { month: '2026-01', baseMonth: '2025-01', realizado: 438_000, baseAnterior: 412_000 },
  { month: '2026-02', baseMonth: '2025-02', realizado: 214_000, baseAnterior: 18_000 },
  { month: '2026-03', baseMonth: '2025-03', realizado: 502_000, baseAnterior: 466_000 },
  { month: '2026-04', baseMonth: '2025-04', realizado: 421_000, baseAnterior: 489_000 },
  { month: '2026-05', baseMonth: '2025-05', realizado: 574_000, baseAnterior: 503_000 },
  { month: '2026-06', baseMonth: '2025-06', realizado: 526_000, baseAnterior: 518_000 },
  { month: '2026-07', baseMonth: '2025-07', realizado: 612_000, baseAnterior: 497_000 },
  { month: '2026-08', baseMonth: '2025-08', realizado: 545_000, baseAnterior: 533_000 },
  { month: '2026-09', baseMonth: '2025-09', realizado: 502_000, baseAnterior: 548_000 },
  { month: '2026-10', baseMonth: '2025-10', realizado: 598_000, baseAnterior: 561_000 },
  { month: '2026-11', baseMonth: '2025-11', realizado: 386_000, baseAnterior: 574_000 },
  { month: '2026-12', baseMonth: '2025-12', realizado: 604_000, baseAnterior: 590_000 },
];

/** Piso de base para publicar variação percentual: abaixo dele, só a variação absoluta. */
export const basePercentFloor = 50_000;
