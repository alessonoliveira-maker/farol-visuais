/**
 * Agendas marcadas pela pré-vendas no mês contra a meta mensal, com o ritmo esperado até a data
 * de corte. Dado fictício e fixo, referente a setembro de 2026 (mês de 30 dias).
 *
 * `elapsedRatio` é a fração do mês já decorrida na data de corte (18 de 30 dias = 0,60).
 * `pace` diz como o ritmo esperado foi calculado: `linear` (fração do mês) ou `curve` (curva
 * histórica de sazonalidade, que chegaria pronta em `expectedRatio`). `projected` é premissa, não
 * medição: a extrapolação do ritmo atual até o fim do mês.
 */
export interface MonthlyPaceGoal {
  readonly label: string;
  readonly period: string;
  readonly cutoffLabel: string;
  readonly value: number;
  readonly target: number;
  readonly elapsedRatio: number;
  readonly pace: 'linear' | 'curve';
  readonly expectedRatio: number;
  readonly projected: number;
}

export const data: MonthlyPaceGoal = {
  label: 'Agendas de pré-vendas',
  period: '2026-09',
  cutoffLabel: 'dia 18 de 30',
  value: 41,
  target: 90,
  elapsedRatio: 0.6,
  pace: 'linear',
  expectedRatio: 0.6,
  projected: 68,
};
