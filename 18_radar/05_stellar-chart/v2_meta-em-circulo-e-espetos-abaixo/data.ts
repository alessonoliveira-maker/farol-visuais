/**
 * Índice de competência de um executivo de vendas nas seis etapas do processo comercial, no
 * terceiro trimestre de 2026, numa escala de 0 a 100 pontos, contra a meta do plano de
 * desenvolvimento.
 * Dado fictício e fixo: "Executivo 07" é um rótulo de posição, não uma pessoa real.
 * A ordem é a do processo e corre no sentido horário a partir do topo. O dado traz um índice
 * exatamente em cima da meta, que não conta como abaixo dela, e um a três pontos de distância,
 * que é o caso em que o rótulo encosta no círculo.
 */
export interface CompetencyScore {
  readonly id: string;
  readonly name: string;
  /** Índice de 0 a 100. */
  readonly value: number;
}

export const data: readonly CompetencyScore[] = [
  { id: 'prospeccao', name: 'Prospecção', value: 38 },
  { id: 'qualificacao', name: 'Qualificação', value: 67 },
  { id: 'diagnostico', name: 'Diagnóstico de necessidade', value: 82 },
  { id: 'proposta', name: 'Proposta de valor', value: 70 },
  { id: 'negociacao', name: 'Negociação', value: 88 },
  { id: 'fechamento', name: 'Fechamento', value: 59 },
];

/** Índice combinado no plano de desenvolvimento: abaixo dele a competência entra em treino. */
export const goal = 70;

/** Quem é avaliado, para a frase acessível. */
export const subject = 'Executivo 07';

/** Período do recorte, já no texto de tela. */
export const periodLabel = '3º trimestre de 2026';
