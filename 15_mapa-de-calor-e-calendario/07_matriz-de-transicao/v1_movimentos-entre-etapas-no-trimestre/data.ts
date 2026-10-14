/**
 * Movimentos entre etapas do funil no trimestre. Dado fictício e fixo: cada linha é a etapa de onde
 * a oportunidade saiu e cada coluna é para onde ela foi, em contagem de movimentos, não de
 * oportunidades (a mesma oportunidade que avança duas vezes conta duas vezes).
 *
 * Três casos difíceis de propósito. A permanência, que é a oportunidade que continuou na mesma
 * etapa, é quase sempre o maior número da linha e por isso fica fora da escala de cor. O retrocesso,
 * abaixo da diagonal, existe e é pequeno: é a classe de movimento que um Sankey esconde. E as duas
 * colunas terminais, Ganha e Perdida, não são etapa do funil e não abrem linha própria.
 */
export interface StageDefinition {
  readonly id: string;
  readonly label: string;
}

/** Etapas do funil, na ordem. Valem como linha e como coluna. */
export const STAGES: readonly StageDefinition[] = [
  { id: 'descoberta', label: 'Descoberta' },
  { id: 'qualificacao', label: 'Qualificação' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'contrato', label: 'Contrato' },
];

/** Destinos terminais, que fecham a oportunidade e não abrem linha. */
export const OUTCOMES: readonly StageDefinition[] = [
  { id: 'ganha', label: 'Ganha' },
  { id: 'perdida', label: 'Perdida' },
];

export interface TransitionRow {
  readonly from: string;
  /** Movimentos para cada etapa de STAGES, na mesma ordem. A posição da própria etapa é permanência. */
  readonly toStages: readonly number[];
  /** Movimentos para cada destino de OUTCOMES, na mesma ordem. */
  readonly toOutcomes: readonly number[];
}

export const data: readonly TransitionRow[] = [
  { from: 'descoberta', toStages: [143, 182, 12, 0, 0, 0], toOutcomes: [0, 96] },
  { from: 'qualificacao', toStages: [9, 88, 124, 6, 0, 0], toOutcomes: [0, 71] },
  { from: 'diagnostico', toStages: [3, 14, 63, 97, 4, 0], toOutcomes: [0, 52] },
  { from: 'proposta', toStages: [2, 5, 11, 47, 68, 3], toOutcomes: [0, 41] },
  { from: 'negociacao', toStages: [0, 1, 4, 9, 31, 44], toOutcomes: [7, 29] },
  { from: 'contrato', toStages: [0, 0, 0, 0, 2, 12], toOutcomes: [38, 5] },
];
