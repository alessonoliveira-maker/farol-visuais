/**
 * Captação líquida mensal contra a meta de captação de uma unidade de negócio fictícia, em
 * reais. A meta ainda não foi definida em dois meses (piloto novo), e a diferença troca de
 * sinal várias vezes entre um mês e outro. Dado fictício e fixo.
 */
export interface MonthlyInflowVsTarget {
  readonly month: string;
  readonly inflow: number;
  readonly target: number | null;
}

export const data: readonly MonthlyInflowVsTarget[] = [
  { month: '2026-01', inflow: 280_000, target: 300_000 },
  { month: '2026-02', inflow: 315_000, target: 305_000 },
  { month: '2026-03', inflow: 295_000, target: 310_000 },
  { month: '2026-04', inflow: 260_000, target: null },
  { month: '2026-05', inflow: 290_000, target: null },
  { month: '2026-06', inflow: 300_000, target: 320_000 },
  { month: '2026-07', inflow: 340_000, target: 325_000 },
  { month: '2026-08', inflow: 315_000, target: 330_000 },
  { month: '2026-09', inflow: 355_000, target: 335_000 },
  { month: '2026-10', inflow: 320_000, target: 340_000 },
  { month: '2026-11', inflow: 360_000, target: 345_000 },
  { month: '2026-12', inflow: 330_000, target: 350_000 },
];
