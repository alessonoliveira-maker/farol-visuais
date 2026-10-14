/**
 * Nota de desempenho no trimestre em seis dimensões comerciais, numa escala comum de 0 a 100 pontos
 * em que mais é sempre melhor: a pessoa avaliada e a média do time de vendas na mesma dimensão.
 * Dado fictício e fixo: "Executivo 07" é um rótulo inventado, nenhuma pessoa real.
 */
export interface DimensionScore {
  readonly id: string;
  readonly dimension: string;
  /** Nota da pessoa avaliada, de 0 a 100. */
  readonly score: number;
  /** Média do time na mesma dimensão, de 0 a 100. */
  readonly teamAverage: number;
}

export const data: readonly DimensionScore[] = [
  { id: 'dim-qualificacao', dimension: 'Qualificação do lead', score: 76, teamAverage: 76 },
  { id: 'dim-resposta', dimension: 'Tempo de primeira resposta', score: 58, teamAverage: 72 },
  { id: 'dim-conversao', dimension: 'Conversão de reunião em proposta', score: 81, teamAverage: 69 },
  { id: 'dim-funil', dimension: 'Funil atualizado em dia', score: 70, teamAverage: 73 },
  { id: 'dim-previsao', dimension: 'Acerto da previsão de fechamento', score: 88, teamAverage: 74 },
  { id: 'dim-proposta', dimension: 'Proposta em até 5 dias', score: 64, teamAverage: 71 },
];

/** Quem está sendo avaliado. */
export const entityLabel = 'Executivo 07';

/** Contra quem a pessoa é comparada. */
export const referenceLabel = 'Média do time';
