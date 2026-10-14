/**
 * Oportunidades perdidas no trimestre por motivo, no funil comercial (pré-vendas e vendas).
 * Dado fictício e fixo: quantidade de negócios perdidos atribuídos a cada motivo, 3º trimestre
 * de 2026, somando 200 perdas. Os valores foram escolhidos para o acumulado cruzar 80% no
 * terceiro motivo (42,0%, 65,0%, 81,5%), de modo que o corte separe 3 motivos de 3; a ordem de
 * entrada é arbitrária de propósito, e "Outros" agrupa a cauda residual e fecha a lista mesmo
 * sendo maior que o último motivo nomeado.
 */
export interface LossReason {
  readonly id: string;
  readonly reason: string;
  readonly count: number;
  /** Motivos residuais agrupados: sempre por último, nunca pela ordem de valor. */
  readonly isOther?: boolean;
}

export const data: readonly LossReason[] = [
  { id: 'preco', reason: 'Preço', count: 46 },
  { id: 'prazo', reason: 'Prazo', count: 9 },
  { id: 'outros', reason: 'Outros', count: 13, isOther: true },
  { id: 'sem-fit', reason: 'Sem fit', count: 84 },
  { id: 'concorrencia', reason: 'Concorrência', count: 15 },
  { id: 'sem-retorno', reason: 'Sem retorno', count: 33 },
];

/** O corte da regra de Pareto, em percentual acumulado: onde o plano de ação começa. */
export const cutPercent = 80;
