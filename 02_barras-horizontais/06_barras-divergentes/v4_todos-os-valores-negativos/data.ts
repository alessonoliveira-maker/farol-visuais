/**
 * Agendas realizadas por fila de pré-vendas em duas semanas seguidas.
 * A variação não mora no dado: o componente calcula a diferença entre as duas semanas.
 * Dado fictício e fixo: filas genéricas de pré-vendas, sem pessoa ou empresa real.
 */
export interface QueueAgendas {
  readonly id: string;
  readonly queue: string;
  /** Agendas realizadas na semana anterior. */
  readonly previousWeek: number;
  /** Agendas realizadas na semana atual. */
  readonly currentWeek: number;
}

export const data: readonly QueueAgendas[] = [
  { id: 'fila-manha', queue: 'Fila da manhã', previousWeek: 42, currentWeek: 31 },
  { id: 'fila-tarde', queue: 'Fila da tarde', previousWeek: 35, currentWeek: 28 },
  { id: 'fila-outbound', queue: 'Outbound ativo', previousWeek: 18, currentWeek: 18 },
  { id: 'fila-reativacao', queue: 'Reativação', previousWeek: 22, currentWeek: 14 },
  { id: 'fila-indicacao', queue: 'Indicação', previousWeek: 9, currentWeek: 6 },
];

/** Semanas comparadas, em YYYY-MM-DD (início de cada semana). */
export const currentWeekStart = '2026-09-07';
export const previousWeekStart = '2026-08-31';
