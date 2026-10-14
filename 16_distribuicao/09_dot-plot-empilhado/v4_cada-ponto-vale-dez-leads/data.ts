/**
 * Leads do mês por faixa de pontuação de qualificação, de 0 a 100 em faixas de 10 pontos. Dado
 * fictício e fixo: são 600 leads no total. O caso difícil é o resto: nenhuma faixa tem contagem
 * redonda, a faixa de 90 a 100 tem só 4 leads (menos que um ponto inteiro) e a mais cheia, de 40 a
 * 49, tem 133, o que pede 13 pontos inteiros e um parcial de 3.
 */
export interface ScoreBand {
  readonly id: string;
  /** Primeiro ponto de pontuação da faixa. */
  readonly from: number;
  /** Último ponto de pontuação da faixa. */
  readonly to: number;
  readonly count: number;
}

/** Quantos leads vale um ponto inteiro. O componente confere a pilha mais alta antes de aceitar. */
export const PREFERRED_UNIT = 10;

export const data: readonly ScoreBand[] = [
  { id: 'score-00', from: 0, to: 9, count: 18 },
  { id: 'score-10', from: 10, to: 19, count: 36 },
  { id: 'score-20', from: 20, to: 29, count: 74 },
  { id: 'score-30', from: 30, to: 39, count: 112 },
  { id: 'score-40', from: 40, to: 49, count: 133 },
  { id: 'score-50', from: 50, to: 59, count: 116 },
  { id: 'score-60', from: 60, to: 69, count: 66 },
  { id: 'score-70', from: 70, to: 79, count: 29 },
  { id: 'score-80', from: 80, to: 89, count: 12 },
  { id: 'score-90', from: 90, to: 100, count: 4 },
];
