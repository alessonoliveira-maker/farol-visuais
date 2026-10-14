/**
 * Orçado e realizado por trimestre de 2026, em reais, em três linhas de custo.
 * Uma linha por trimestre e por regime (orçado ou realizado).
 * Dado fictício e fixo: nenhum valor corresponde a orçamento real de empresa real.
 */
export interface QuarterlyBudgetRow {
  readonly quarter: string;
  readonly regime: 'orcado' | 'realizado';
  /** Falso só no trimestre sem orçamento aprovado; nesse caso as três linhas abaixo são null. */
  readonly budgetApproved: boolean;
  readonly consultoria: number | null;
  readonly gestao: number | null;
  readonly imoveis: number | null;
}

export const data: readonly QuarterlyBudgetRow[] = [
  { quarter: 'T1/2026', regime: 'orcado', budgetApproved: true, consultoria: 180_000, gestao: 220_000, imoveis: 90_000 },
  { quarter: 'T1/2026', regime: 'realizado', budgetApproved: true, consultoria: 165_000, gestao: 235_000, imoveis: 95_000 },
  { quarter: 'T2/2026', regime: 'orcado', budgetApproved: true, consultoria: 190_000, gestao: 225_000, imoveis: 95_000 },
  { quarter: 'T2/2026', regime: 'realizado', budgetApproved: true, consultoria: 200_000, gestao: 210_000, imoveis: 88_000 },
  { quarter: 'T3/2026', regime: 'orcado', budgetApproved: true, consultoria: 200_000, gestao: 230_000, imoveis: 100_000 },
  { quarter: 'T3/2026', regime: 'realizado', budgetApproved: true, consultoria: 215_000, gestao: 245_000, imoveis: 120_000 },
  { quarter: 'T4/2026', regime: 'orcado', budgetApproved: false, consultoria: null, gestao: null, imoveis: null },
  { quarter: 'T4/2026', regime: 'realizado', budgetApproved: true, consultoria: 210_000, gestao: 238_000, imoveis: 102_000 },
];
