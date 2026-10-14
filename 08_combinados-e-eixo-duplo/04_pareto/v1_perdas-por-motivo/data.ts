/**
 * Oportunidades perdidas no trimestre por motivo, no funil comercial (pré-vendas e vendas).
 * Dado fictício e fixo: quantidade de negócios perdidos atribuídos a cada motivo, 3º trimestre
 * de 2026. A ordem de entrada é arbitrária de propósito, para o componente demonstrar a
 * ordenação decrescente com desempate por nome; "Outros" agrupa os motivos residuais e sempre
 * fecha a lista, mesmo quando maior que a última categoria nomeada.
 */
export interface LossReason {
  readonly id: string;
  readonly reason: string;
  readonly count: number;
  /** Motivos residuais agrupados: sempre por último, nunca pela ordem de valor. */
  readonly isOther?: boolean;
}

export const data: readonly LossReason[] = [
  { id: 'preco', reason: 'Preço', count: 27 },
  { id: 'outros', reason: 'Outros', count: 30, isOther: true },
  { id: 'sem-retorno', reason: 'Sem retorno', count: 21 },
  { id: 'sem-fit', reason: 'Sem fit', count: 45 },
  { id: 'concorrencia', reason: 'Concorrência', count: 27 },
];
