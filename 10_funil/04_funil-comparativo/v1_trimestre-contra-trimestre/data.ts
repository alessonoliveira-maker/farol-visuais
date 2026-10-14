/**
 * Volume de oportunidades por etapa do funil comercial, comparando o trimestre atual com o
 * trimestre anterior. Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface FunnelStageComparison {
  readonly id: string;
  readonly stage: string;
  readonly currentValue: number;
  readonly previousValue: number;
}

export const data: readonly FunnelStageComparison[] = [
  { id: 'aberta', stage: 'Aberta', currentValue: 420, previousValue: 395 },
  { id: 'diagnostico', stage: 'Diagnóstico', currentValue: 268, previousValue: 241 },
  { id: 'proposta', stage: 'Proposta', currentValue: 131, previousValue: 138 },
  { id: 'negociacao', stage: 'Negociação', currentValue: 64, previousValue: 70 },
  { id: 'ganha', stage: 'Ganha', currentValue: 29, previousValue: 34 },
];

/** Rótulo do período atual, por extenso, sem sigla. */
export const currentPeriodLabel = '3º trimestre de 2026';
/** Rótulo do período anterior, por extenso, sem sigla. */
export const previousPeriodLabel = '2º trimestre de 2026';
