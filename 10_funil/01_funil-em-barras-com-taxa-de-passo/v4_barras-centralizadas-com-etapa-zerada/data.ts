/**
 * Funil comercial da unidade Sul, semana de 2026-09-07 (2026-W37). Dado fictício e fixo: nenhuma
 * organização ou pessoa real. A semana fechou sem nenhuma oportunidade ganha.
 */
export interface FunnelStageZero {
  readonly id: string;
  readonly label: string;
  readonly noun: string;
  readonly value: number;
}

export const data: readonly FunnelStageZero[] = [
  { id: 'aberta', label: 'Aberta', noun: 'oportunidades', value: 38 },
  { id: 'diagnostico', label: 'Diagnóstico', noun: 'oportunidades', value: 22 },
  { id: 'proposta', label: 'Proposta', noun: 'oportunidades', value: 9 },
  { id: 'negociacao', label: 'Negociação', noun: 'oportunidades', value: 4 },
  { id: 'ganha', label: 'Ganha', noun: 'ganhos', value: 0 },
];
