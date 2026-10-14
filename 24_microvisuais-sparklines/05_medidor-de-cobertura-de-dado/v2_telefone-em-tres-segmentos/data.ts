/**
 * Qualidade do campo telefone na base de leads do trimestre, em contagem de leads: válido,
 * malformado (corrigível) e ausente (nenhum telefone). Dado fictício e fixo, 2026 T3.
 * Os três estados somam o total; ausente é categoria própria, nunca zero.
 */
export type PhoneState = 'valid' | 'malformed' | 'missing';

export interface PhoneSegment {
  readonly state: PhoneState;
  readonly count: number;
}

export interface PhoneQuality {
  readonly period: string;
  readonly segments: readonly PhoneSegment[];
}

export const data: PhoneQuality = {
  period: '2026 T3',
  segments: [
    { state: 'valid', count: 2_318 },
    { state: 'malformed', count: 502 },
    { state: 'missing', count: 1_040 },
  ],
};
