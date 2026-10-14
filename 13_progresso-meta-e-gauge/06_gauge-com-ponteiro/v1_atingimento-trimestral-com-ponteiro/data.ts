/**
 * Atingimento da meta de receita do trimestre comercial, em pontos percentuais da meta. Escala de
 * 0 a 150, dividida em três faixas por intensidade de um único tom. Dado fictício e fixo,
 * referente a 2026-T3 (julho a setembro).
 */
export interface AttainmentBand {
  readonly id: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

export interface QuarterlyAttainmentGauge {
  readonly label: string;
  readonly period: string;
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly bands: readonly AttainmentBand[];
}

export const data: QuarterlyAttainmentGauge = {
  label: 'Atingimento da meta de receita',
  period: '2026-T3',
  min: 0,
  max: 150,
  value: 83,
  bands: [
    { id: 'baixo', label: 'Abaixo do esperado', from: 0, to: 70 },
    { id: 'rota', label: 'Em rota', from: 70, to: 100 },
    { id: 'acima', label: 'Acima da meta', from: 100, to: 150 },
  ],
};
