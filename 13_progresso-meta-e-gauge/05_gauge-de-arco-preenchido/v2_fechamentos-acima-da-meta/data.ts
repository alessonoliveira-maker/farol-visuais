/**
 * Fechamentos do mês contra a meta comercial, em contagem de oportunidades ganhas.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface MonthlyArcOverGoal {
  readonly period: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  /** De onde vem a meta: sem isso o traço sobre o arco não significa nada. */
  readonly targetSource: string;
}

export const data: MonthlyArcOverGoal = {
  period: '2026-08',
  label: 'Oportunidades ganhas',
  value: 23,
  target: 20,
  targetSource: 'fixada no orçamento comercial de 2026 para o mês',
};
