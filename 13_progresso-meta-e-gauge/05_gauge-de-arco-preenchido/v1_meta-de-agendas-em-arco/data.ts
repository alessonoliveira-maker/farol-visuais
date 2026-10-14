/**
 * Agendas marcadas pela pré-vendas no mês contra a meta mensal, em contagem absoluta.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface MonthlyArcGoal {
  readonly period: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  /** De onde vem o limite superior do arco: sem isso o número da meta não significa nada. */
  readonly targetSource: string;
}

export const data: MonthlyArcGoal = {
  period: '2026-09',
  label: 'Agendas marcadas',
  value: 57,
  target: 90,
  targetSource: 'definida no planejamento comercial junto com o time de pré-vendas para o mês',
};
