/**
 * O perdido de cada etapa do funil comercial (2026-T3), quebrado nos cinco motivos de descarte
 * mais comuns. Mesma base de entrada, avanço e andamento da versão básica; dado fictício e fixo,
 * em número de oportunidades.
 *
 * Fechamento auditado a mão: em toda linha, advanced + soma dos motivos + inProgress = entered.
 */
export type MotiveKey = 'noProfile' | 'noContact' | 'timing' | 'competition' | 'price';

export interface MotiveDefinition {
  readonly key: MotiveKey;
  readonly label: string;
  /** Slot categórico fixo (CONTRATO, COR-8): 1, 3, 6, 5, 2 nesta ordem, nunca 2 ou 4 primeiro. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface StageMotiveRow {
  readonly id: string;
  readonly stage: string;
  readonly entered: number;
  readonly advanced: number;
  readonly inProgress: number;
  readonly noProfile: number;
  readonly noContact: number;
  readonly timing: number;
  readonly competition: number;
  readonly price: number;
}

export const motives: readonly MotiveDefinition[] = [
  { key: 'noProfile', label: 'Sem perfil', slot: 1 },
  { key: 'noContact', label: 'Sem contato', slot: 3 },
  { key: 'timing', label: 'Timing', slot: 6 },
  { key: 'competition', label: 'Concorrência', slot: 5 },
  { key: 'price', label: 'Preço', slot: 2 },
];

export const data: readonly StageMotiveRow[] = [
  { id: 'aberta', stage: 'Aberta', entered: 420, advanced: 268, inProgress: 34, noProfile: 38, noContact: 32, timing: 21, competition: 15, price: 12 },
  { id: 'diagnostico', stage: 'Diagnóstico', entered: 268, advanced: 131, inProgress: 36, noProfile: 22, noContact: 26, timing: 19, competition: 20, price: 14 },
  { id: 'proposta', stage: 'Proposta', entered: 131, advanced: 64, inProgress: 22, noProfile: 6, noContact: 5, timing: 8, competition: 16, price: 10 },
  { id: 'negociacao', stage: 'Negociação', entered: 64, advanced: 29, inProgress: 14, noProfile: 3, noContact: 4, timing: 5, competition: 6, price: 3 },
];
