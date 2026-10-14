/**
 * Receita reconhecida do trimestre comercial contra a meta do período, em reais.
 * Dado fictício e fixo, referente a 2026 T3 (julho a setembro).
 */
export interface QuarterGoal {
  readonly label: string;
  readonly period: string;
  readonly value: number;
  readonly target: number;
}

export const data: QuarterGoal = {
  label: 'Receita reconhecida',
  period: '2026 T3',
  value: 4_180_000,
  target: 5_000_000,
};
