/**
 * Capacidade da pré-vendas do mês seguinte, com o valor real passando do máximo do arco. Mesma
 * escala de 0 a 320 entradas e o mesmo teto medido de 274 do modelo v3, para o caso limite ficar
 * comparável. Dado fictício e fixo, referente a 2026-09.
 */
export interface CapacityBand {
  readonly id: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

export interface OverflowCapacityGauge {
  readonly label: string;
  readonly period: string;
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly ceiling: number;
  readonly bands: readonly CapacityBand[];
}

export const data: OverflowCapacityGauge = {
  label: 'Entradas na pré-vendas',
  period: '2026-09',
  unit: 'entradas',
  min: 0,
  max: 320,
  value: 338,
  ceiling: 274,
  bands: [
    { id: 'confortavel', label: 'Confortável', from: 0, to: 240 },
    { id: 'atencao', label: 'Atenção', from: 240, to: 274 },
    { id: 'estouro', label: 'Estouro', from: 274, to: 320 },
  ],
};
