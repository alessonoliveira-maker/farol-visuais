/**
 * As mesmas três metas da semana (entradas tratadas, agendas marcadas, SLA cumprido) para seis
 * pessoas da pré-vendas, na mesma escala. Dado fictício e fixo: quem fechou todas, quem ficou
 * devendo uma e quem ficou devendo mais de uma.
 */
export interface GoalCount {
  readonly value: number;
  readonly goal: number;
}

export interface PersonGoalStatus {
  readonly id: string;
  readonly name: string;
  readonly entradas: GoalCount;
  readonly agendas: GoalCount;
  readonly sla: GoalCount;
}

export const weekStart = '2026-09-07';

export const data: readonly PersonGoalStatus[] = [
  { id: 'p1', name: 'Talita V.', entradas: { value: 28, goal: 24 }, agendas: { value: 9, goal: 8 }, sla: { value: 12, goal: 12 } },
  { id: 'p2', name: 'Murilo C.', entradas: { value: 19, goal: 22 }, agendas: { value: 7, goal: 8 }, sla: { value: 11, goal: 10 } },
  { id: 'p3', name: 'Ingrid S.', entradas: { value: 26, goal: 24 }, agendas: { value: 6, goal: 8 }, sla: { value: 9, goal: 10 } },
  { id: 'p4', name: 'Renan A.', entradas: { value: 23, goal: 24 }, agendas: { value: 8, goal: 8 }, sla: { value: 10, goal: 10 } },
  { id: 'p5', name: 'Lorena B.', entradas: { value: 17, goal: 24 }, agendas: { value: 5, goal: 8 }, sla: { value: 8, goal: 10 } },
  {
    id: 'p6',
    name: 'Heitor de Moraes Prado',
    entradas: { value: 25, goal: 24 },
    agendas: { value: 4, goal: 8 },
    sla: { value: 10, goal: 10 },
  },
];
