/**
 * Saldo mensal da verba de mídia, de 2026-03 a 2026-08, em reais: liberado menos investido em cada
 * mês. O acumulado parte de R$ 0 em 2026-03 (sem saldo anterior), chega a +R$ 9 mil em abril e maio,
 * cruza o zero em junho e fecha agosto em −R$ 8 mil. Maio fecha com saldo zero e continua no dado.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Fechamento: 6.000 + 3.000 + 0 − 12.000 − 9.000 + 4.000 = −8.000.
 */
export interface MonthlyBudgetBalance {
  readonly month: string;
  readonly balance: number;
}

export const data: readonly MonthlyBudgetBalance[] = [
  { month: '2026-03', balance: 6_000 },
  { month: '2026-04', balance: 3_000 },
  { month: '2026-05', balance: 0 },
  { month: '2026-06', balance: -12_000 },
  { month: '2026-07', balance: -9_000 },
  { month: '2026-08', balance: 4_000 },
];
