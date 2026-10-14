/**
 * Entradas da pré-vendas por dia útil da semana de 2026-09-07 a 2026-09-11, contadas pelo
 * status do SLA de primeiro contato. Segunda-feira, 2026-09-07, é feriado: sem expediente.
 * Dado fictício e fixo.
 */
export interface DaySlaEntries {
  readonly id: string;
  readonly day: string;
  readonly date: string;
  readonly closed: boolean;
  readonly withinSla: number;
  readonly outsideSla: number;
  readonly pending: number;
}

export const data: readonly DaySlaEntries[] = [
  { id: 'seg', day: 'Segunda', date: '2026-09-07', closed: true, withinSla: 0, outsideSla: 0, pending: 0 },
  { id: 'ter', day: 'Terça', date: '2026-09-08', closed: false, withinSla: 25, outsideSla: 9, pending: 5 },
  { id: 'qua', day: 'Quarta', date: '2026-09-09', closed: false, withinSla: 26, outsideSla: 10, pending: 5 },
  { id: 'qui', day: 'Quinta', date: '2026-09-10', closed: false, withinSla: 32, outsideSla: 8, pending: 3 },
  { id: 'sex', day: 'Sexta', date: '2026-09-11', closed: false, withinSla: 17, outsideSla: 14, pending: 9 },
];
