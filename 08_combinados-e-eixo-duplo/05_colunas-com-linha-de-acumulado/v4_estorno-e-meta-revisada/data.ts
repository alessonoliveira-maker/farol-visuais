/**
 * Receita reconhecida por mês em 2026, em reais, com um estorno em maio maior do que tudo o que
 * entrou naquele mês, e a meta anual vigente em cada mês.
 *
 * A meta muda no meio do ano: vale R$ 1,2 mi de janeiro a maio e R$ 1,0 mi de junho em diante,
 * revisada para baixo depois do estorno. Ela mora aqui mês a mês, e não numa constante única,
 * porque é assim que o degrau da revisão sai do dado em vez de ser desenhado à mão.
 *
 * Os quatro últimos meses ainda não fecharam e entram como `null`: a coluna não nasce zerada e a
 * linha do acumulado para no último mês fechado. A meta continua declarada nesses meses, porque
 * ela vale para o ano inteiro e não para o que já foi realizado.
 *
 * Dado fictício e fixo: nenhum nome cita marca, campanha ou cliente real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenue: number | null;
  /** Meta anual vigente neste mês, em reais. */
  readonly target: number;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenue: 120_000, target: 1_200_000 },
  { month: '2026-02', revenue: 95_000, target: 1_200_000 },
  { month: '2026-03', revenue: 160_000, target: 1_200_000 },
  { month: '2026-04', revenue: 110_000, target: 1_200_000 },
  { month: '2026-05', revenue: -180_000, target: 1_200_000 },
  { month: '2026-06', revenue: 130_000, target: 1_000_000 },
  { month: '2026-07', revenue: 105_000, target: 1_000_000 },
  { month: '2026-08', revenue: 125_000, target: 1_000_000 },
  { month: '2026-09', revenue: null, target: 1_000_000 },
  { month: '2026-10', revenue: null, target: 1_000_000 },
  { month: '2026-11', revenue: null, target: 1_000_000 },
  { month: '2026-12', revenue: null, target: 1_000_000 },
];
