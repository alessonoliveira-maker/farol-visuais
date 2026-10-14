/**
 * Custo de um projeto contra o orçado, em reais, nos oito primeiros meses de 2026.
 * Dado fictício e fixo: nenhum valor vem de sistema real.
 *
 * O dado é feito de casos-limite, e cada um está aqui de propósito:
 * janeiro tem desvio de R$ 800, ao lado de um desvio de R$ 900 mil em abril;
 * abril tem orçado ZERO, uma frente que ninguém orçou e que gastou;
 * maio tem orçado AUSENTE, que é coisa diferente de orçado zero e não tem base de comparação;
 * julho e agosto correm contra a segunda versão do orçamento, aprovada no meio do ano.
 */
export interface MonthlyProjectCostVsBudget {
  readonly month: string;
  readonly realizado: number;
  /** Orçado do mês. `0` é orçamento zero medido; `null` é mês sem orçamento registrado. */
  readonly orcado: number | null;
}

export const data: readonly MonthlyProjectCostVsBudget[] = [
  { month: '2026-01', realizado: 1_204_800, orcado: 1_204_000 },
  { month: '2026-02', realizado: 1_180_000, orcado: 1_210_000 },
  { month: '2026-03', realizado: 1_262_000, orcado: 1_215_000 },
  { month: '2026-04', realizado: 900_000, orcado: 0 },
  { month: '2026-05', realizado: 1_190_000, orcado: null },
  { month: '2026-06', realizado: 1_243_000, orcado: 1_220_000 },
  { month: '2026-07', realizado: 1_288_000, orcado: 1_350_000 },
  { month: '2026-08', realizado: 1_301_000, orcado: 1_360_000 },
];

/**
 * A troca de versão do orçamento: a partir deste mês a referência é outra.
 * Sem a versão declarada, a variação mistura dois orçamentos e não é publicável.
 */
export const budgetVersion = { fromMonth: '2026-07', label: 'v2' } as const;
