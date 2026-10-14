/**
 * Três metas independentes da mesma equipe de pré-vendas na mesma semana: entradas tratadas,
 * agendas marcadas e atendimentos dentro do SLA. Dado fictício e fixo, ordenado do anel de fora
 * (a meta mais importante da semana) para o de dentro.
 */
export interface WeeklyGoalRing {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly goal: number | null;
  readonly unit: string;
}

/** Segunda-feira da semana medida. */
export const weekStart = '2026-09-07';

export const data: readonly WeeklyGoalRing[] = [
  { id: 'entradas', label: 'Entradas tratadas', value: 132, goal: 120, unit: 'entradas' },
  { id: 'agendas', label: 'Agendas marcadas', value: 34, goal: 40, unit: 'agendas' },
  { id: 'sla', label: 'SLA cumprido', value: 51, goal: 58, unit: 'atendimentos' },
];
