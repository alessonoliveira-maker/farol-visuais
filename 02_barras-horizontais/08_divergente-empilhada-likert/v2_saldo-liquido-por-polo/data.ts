/**
 * Avaliação dos leads recebidos da pré-vendas no formulário de handoff de julho a setembro de 2026:
 * contagem de respostas por ponto da escala de 5 pontos, em sete critérios. O saldo de cada critério
 * é o percentual do polo positivo menos o do negativo, em pontos percentuais.
 * Dado fictício e fixo: nenhum critério, pessoa ou empresa é real.
 */

/** Ponto da escala de 5, do polo negativo ao positivo. */
export type RatingKey = 'veryBad' | 'bad' | 'neutral' | 'good' | 'veryGood';

export interface ScalePoint {
  readonly key: RatingKey;
  /** Texto de tela do ponto. */
  readonly label: string;
  readonly pole: 'negative' | 'neutral' | 'positive';
  /**
   * Slot categórico fixo do ponto (1 a 6, que viram `--chart-1` a `--chart-6`). O dicionário usa os
   * quatro primeiros da ordem 1, 3, 6, 5 (CONTRATO, COR-8): tons frios no polo bom e quentes no
   * ruim, com o mais forte de cada polo na ponta. O neutro não tem slot: vai no neutro de dado.
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface CriterionRatings {
  readonly id: string;
  readonly label: string;
  /** Respostas por ponto da escala; zero é zero medido. */
  readonly counts: Readonly<Record<RatingKey, number>>;
}

/** A escala, do polo negativo ao positivo: é a ordem da pilha e da legenda. */
export const scale: readonly ScalePoint[] = [
  { key: 'veryBad', label: 'Muito ruim', pole: 'negative', slot: 5 },
  { key: 'bad', label: 'Ruim', pole: 'negative', slot: 6 },
  { key: 'neutral', label: 'Neutro', pole: 'neutral' },
  { key: 'good', label: 'Bom', pole: 'positive', slot: 3 },
  { key: 'veryGood', label: 'Muito bom', pole: 'positive', slot: 1 },
];

/** Na ordem do formulário: o componente reordena pelo saldo. Dois critérios fecham no negativo. */
export const data: readonly CriterionRatings[] = [
  { id: 'fit', label: 'Aderência ao perfil de cliente', counts: { veryBad: 5, bad: 10, neutral: 9, good: 14, veryGood: 6 } },
  { id: 'pain', label: 'Dor do cliente registrada', counts: { veryBad: 2, bad: 5, neutral: 8, good: 19, veryGood: 10 } },
  { id: 'decision-maker', label: 'Contato com quem decide', counts: { veryBad: 8, bad: 13, neutral: 9, good: 9, veryGood: 5 } },
  { id: 'timeline', label: 'Prazo de decisão informado', counts: { veryBad: 4, bad: 10, neutral: 12, good: 13, veryGood: 5 } },
  { id: 'budget', label: 'Orçamento confirmado na conversa', counts: { veryBad: 6, bad: 11, neutral: 12, good: 10, veryGood: 5 } },
  { id: 'wealth', label: 'Patrimônio ou faturamento estimado', counts: { veryBad: 1, bad: 4, neutral: 7, good: 18, veryGood: 12 } },
  { id: 'history', label: 'Histórico de conversa anexado', counts: { veryBad: 0, bad: 3, neutral: 5, good: 17, veryGood: 17 } },
];
