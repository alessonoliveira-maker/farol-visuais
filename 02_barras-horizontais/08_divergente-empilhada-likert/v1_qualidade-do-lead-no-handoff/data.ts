/**
 * Avaliação dos leads recebidos da pré-vendas, dada pelos executivos de vendas no formulário de
 * handoff do 3º trimestre de 2026: contagem de respostas por ponto da escala de 5 pontos, em cada
 * um dos seis critérios. O executivo pode pular um critério, então o n varia entre eles.
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

/** Critérios na ordem do formulário de handoff, que é a ordem em que o executivo responde. */
export const data: readonly CriterionRatings[] = [
  { id: 'fit', label: 'Aderência ao perfil de cliente', counts: { veryBad: 4, bad: 9, neutral: 8, good: 15, veryGood: 6 } },
  { id: 'pain', label: 'Dor do cliente registrada', counts: { veryBad: 2, bad: 6, neutral: 7, good: 18, veryGood: 9 } },
  { id: 'decision-maker', label: 'Contato com quem decide', counts: { veryBad: 7, bad: 12, neutral: 9, good: 10, veryGood: 4 } },
  { id: 'timeline', label: 'Prazo de decisão informado', counts: { veryBad: 3, bad: 8, neutral: 14, good: 12, veryGood: 5 } },
  { id: 'wealth', label: 'Patrimônio ou faturamento estimado', counts: { veryBad: 1, bad: 3, neutral: 6, good: 17, veryGood: 13 } },
  { id: 'history', label: 'Histórico de conversa anexado', counts: { veryBad: 0, bad: 2, neutral: 5, good: 16, veryGood: 15 } },
];
