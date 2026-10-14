/**
 * Oportunidades perdidas no trimestre por motivo e por etapa do funil, em duas grandezas:
 * quantidade de negócios perdidos e valor perdido em reais.
 * Dado fictício e fixo, 3º trimestre de 2026. As duas grandezas foram escolhidas para ordenar
 * DIFERENTE de propósito: "Concorrência" é o 4º motivo em quantidade na pré-vendas e o 1º em
 * valor, porque são poucos negócios de ticket alto. Por isso o visual alterna entre as duas
 * grandezas em vez de misturá-las no mesmo desenho, e o corte de 80% é recalculado a cada troca.
 * "Outros" agrupa a cauda residual de cada etapa e fecha a lista, nunca entra pela ordem de valor.
 */
export interface StageLossReason {
  readonly id: string;
  readonly reason: string;
  /** Negócios perdidos com este motivo, na etapa. */
  readonly count: number;
  /** Valor perdido em reais, no mesmo recorte. */
  readonly amount: number;
  readonly isOther?: boolean;
}

export interface StageLosses {
  readonly id: string;
  readonly stage: string;
  readonly reasons: readonly StageLossReason[];
}

export const data: readonly StageLosses[] = [
  {
    id: 'pre-vendas',
    stage: 'Pré-vendas',
    reasons: [
      { id: 'sem-retorno', reason: 'Sem retorno', count: 48, amount: 720_000 },
      { id: 'outros', reason: 'Outros', count: 18, amount: 420_000, isOther: true },
      { id: 'sem-fit', reason: 'Sem fit', count: 62, amount: 1_240_000 },
      { id: 'concorrencia', reason: 'Concorrência', count: 12, amount: 1_560_000 },
      { id: 'sem-contato', reason: 'Sem contato', count: 30, amount: 380_000 },
    ],
  },
  {
    id: 'vendas',
    stage: 'Vendas',
    reasons: [
      { id: 'prazo', reason: 'Prazo', count: 6, amount: 900_000 },
      { id: 'concorrencia', reason: 'Concorrência', count: 11, amount: 3_400_000 },
      { id: 'outros', reason: 'Outros', count: 5, amount: 640_000, isOther: true },
      { id: 'preco', reason: 'Preço', count: 14, amount: 2_100_000 },
      { id: 'sem-verba', reason: 'Sem verba', count: 4, amount: 260_000 },
    ],
  },
];

/** O corte da regra de Pareto, em percentual acumulado. */
export const cutPercent = 80;
