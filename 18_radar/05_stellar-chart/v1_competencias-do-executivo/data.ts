/**
 * Índice de competência de um executivo de vendas nas seis etapas do processo comercial, no
 * terceiro trimestre de 2026, numa escala de 0 a 100 pontos.
 * Dado fictício e fixo: "Executivo 07" é um rótulo de posição, não uma pessoa real.
 * A ordem é a do processo, da prospecção ao fechamento, e é ela que corre no sentido horário a
 * partir do topo. O dado traz um nome longo, que quebra em duas linhas, e um índice baixo, que
 * deixa o rótulo perto do miolo.
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

/** Quem é avaliado, para a frase acessível. */
export const subject = 'Executivo 07';

/** Período do recorte, já no texto de tela. */
export const periodLabel = '3º trimestre de 2026';
