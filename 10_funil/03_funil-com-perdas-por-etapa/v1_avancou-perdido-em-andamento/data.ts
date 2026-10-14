/**
 * Retrato do funil comercial em 2026-09-14, cortando o trimestre 2026-T3: quantas oportunidades
 * entraram em cada etapa, quantas avançaram para a próxima, quantas foram perdidas e quantas
 * ainda seguem em andamento. Dado fictício e fixo, em número de oportunidades.
 *
 * Fechamento auditado a mão: em toda linha, advanced + lost + inProgress = entered; e o entered
 * de uma etapa é sempre igual ao advanced da etapa anterior (a mesma população desce o funil).
 */
export interface StageLossRow {
  readonly id: string;
  readonly stage: string;
  /** Quantas oportunidades entraram nesta etapa. */
  readonly entered: number;
  /** Quantas avançaram para a etapa seguinte. */
  readonly advanced: number;
  /** Quantas foram perdidas dentro desta etapa. */
  readonly lost: number;
  /** Quantas ainda estão em andamento nesta etapa, na data do retrato. */
  readonly inProgress: number;
}

export const data: readonly StageLossRow[] = [
  { id: 'aberta', stage: 'Aberta', entered: 420, advanced: 268, lost: 118, inProgress: 34 },
  { id: 'diagnostico', stage: 'Diagnóstico', entered: 268, advanced: 131, lost: 101, inProgress: 36 },
  { id: 'proposta', stage: 'Proposta', entered: 131, advanced: 64, lost: 45, inProgress: 22 },
  { id: 'negociacao', stage: 'Negociação', entered: 64, advanced: 29, lost: 21, inProgress: 14 },
];
