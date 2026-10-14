/**
 * Oportunidades abertas por etapa do funil comercial no trimestre 2026 T3, em unidades.
 * Mesmo recorte da versão básica: dado fictício e fixo, nenhuma empresa ou pessoa real.
 */
export interface FunnelStage {
  readonly id: string;
  readonly stage: string;
  readonly value: number;
}

export const data: readonly FunnelStage[] = [
  { id: 'aberta', stage: 'Aberta', value: 420 },
  { id: 'diagnostico', stage: 'Diagnóstico', value: 268 },
  { id: 'proposta', stage: 'Proposta', value: 131 },
  { id: 'negociacao', stage: 'Negociação', value: 64 },
  { id: 'ganha', stage: 'Ganha', value: 29 },
];

/** Rótulo do período mostrado na leitura do topo. */
export const periodLabel = '2026 T3';
