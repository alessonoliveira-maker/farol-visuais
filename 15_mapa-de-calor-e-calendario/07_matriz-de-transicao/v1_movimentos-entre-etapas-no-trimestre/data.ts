/**
 * Oportunidades do funil entre duas fotos, 2026-06-30 e 2026-09-14. Dado fictício e fixo: a linha é
 * a etapa em que a oportunidade estava na primeira data (de), a coluna é onde estava na segunda
 * (para), e cada uma das 1.340 oportunidades cai em exatamente uma célula. Por isso os cinco totais
 * (permaneceram, avançaram, regrediram, entraram, saíram) somam as 1.340.
 *
 * Quatro casos difíceis de propósito. A permanência, que é a oportunidade que continuou na mesma
 * etapa, é quase sempre o maior número da linha e por isso fica fora da escala de cor. O retrocesso,
 * abaixo da diagonal, existe e é pequeno: é a classe de movimento que um Sankey esconde. As duas
 * colunas terminais, Ganha e Perdida, não são etapa do funil e não abrem linha própria. E a linha
 * Nova no trimestre não é etapa: guarda quem não existia na primeira foto e onde está na segunda,
 * entre as oportunidades ainda abertas no fim do período; quem entrou e já fechou antes de 2026-09-14
 * fica fora desta foto, por isso as duas colunas terminais dela valem zero medido.
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

/** Identificador da linha das entradas: não é etapa, e a posição dela na lista de etapas não existe. */
export const NEW_ID = 'nova';
export const NEW_LABEL = 'Nova no trimestre';

export interface TransitionRow {
  readonly from: string;
  /** Oportunidades em cada etapa de STAGES na segunda foto. Na linha de uma etapa, a posição dela é permanência. */
  readonly toStages: readonly number[];
  /** Oportunidades em cada destino de OUTCOMES, na mesma ordem. */
  readonly toOutcomes: readonly number[];
}

export const data: readonly TransitionRow[] = [
  { from: 'descoberta', toStages: [98, 182, 12, 0, 0, 0], toOutcomes: [0, 70] },
  { from: 'qualificacao', toStages: [9, 58, 124, 6, 0, 0], toOutcomes: [0, 52] },
  { from: 'diagnostico', toStages: [3, 14, 40, 97, 4, 0], toOutcomes: [0, 40] },
  { from: 'proposta', toStages: [2, 5, 11, 32, 68, 3], toOutcomes: [0, 32] },
  { from: 'negociacao', toStages: [0, 1, 4, 9, 21, 44], toOutcomes: [7, 29] },
  { from: 'contrato', toStages: [0, 0, 0, 0, 2, 8], toOutcomes: [38, 5] },
  { from: NEW_ID, toStages: [150, 38, 14, 6, 2, 0], toOutcomes: [0, 0] },
];

/** Primeira e segunda foto, para o recorte aparecer desenhado e não só na frase acessível. */
export const periodStart = '2026-06-30';
export const periodEnd = '2026-09-14';
