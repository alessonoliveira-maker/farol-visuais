/**
 * Capacidade da pré-vendas: entradas no funil por mês contra o teto de atendimento medido pelo
 * time. Escala de 0 a 320 entradas, com a faixa de estouro acima do teto de 274. Dado fictício e
 * fixo, referente a 2026-08.
 */
export interface CapacityBand {
  readonly id: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

export interface CapacityGauge {
  readonly label: string;
  readonly period: string;
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly value: number;
  /** Teto de atendimento medido pelo time, não uma meta arbitrária. */
  readonly ceiling: number;
  readonly bands: readonly CapacityBand[];
}

export const data: CapacityGauge = {
  label: 'Entradas na pré-vendas',
  period: '2026-08',
  unit: 'entradas',
  min: 0,
  max: 320,
  value: 258,
  ceiling: 274,
  bands: [
    { id: 'confortavel', label: 'Confortável', from: 0, to: 240 },
    { id: 'atencao', label: 'Atenção', from: 240, to: 274 },
    { id: 'estouro', label: 'Estouro', from: 274, to: 320 },
  ],
};
