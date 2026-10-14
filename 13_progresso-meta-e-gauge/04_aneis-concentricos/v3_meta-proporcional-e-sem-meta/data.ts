/**
 * Uma pessoa que entrou na pré-vendas no meio da semana: duas metas viram proporcionais aos dias
 * úteis restantes, a terceira ainda não tem meta definida, e uma delas passa de 100%. Dado
 * fictício e fixo.
 */
export interface ProportionalGoalRing {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly goal: number | null;
  readonly unit: string;
  readonly proportional: boolean;
}

export const weekStart = '2026-09-07';
export const joinedOn = '2026-09-09';
export const businessDaysConsidered = 3;
export const businessDaysInWeek = 5;

export const data: readonly ProportionalGoalRing[] = [
  { id: 'entradas', label: 'Entradas tratadas', value: 41, goal: 24, unit: 'entradas', proportional: true },
  { id: 'agendas', label: 'Agendas marcadas', value: 9, goal: 10, unit: 'agendas', proportional: true },
  { id: 'sla', label: 'SLA cumprido', value: 7, goal: null, unit: 'atendimentos', proportional: false },
];
