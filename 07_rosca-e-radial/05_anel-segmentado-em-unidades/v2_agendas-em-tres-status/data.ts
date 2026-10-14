/**
 * As 20 agendas da meta semanal em três status, na ordem fixa realizada, marcada, faltante.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export type WeeklyGoalStatus = 'realizada' | 'marcada' | 'faltante';

export interface WeeklyGoalStatusUnit {
  readonly id: string;
  readonly status: WeeklyGoalStatus;
}

export const goal = 20;

/** Ordem do array já é a ordem de desenho do anel: 9 realizadas, 6 marcadas, 5 faltantes. */
export const data: readonly WeeklyGoalStatusUnit[] = [
  { id: 'meta-01', status: 'realizada' },
  { id: 'meta-02', status: 'realizada' },
  { id: 'meta-03', status: 'realizada' },
  { id: 'meta-04', status: 'realizada' },
  { id: 'meta-05', status: 'realizada' },
  { id: 'meta-06', status: 'realizada' },
  { id: 'meta-07', status: 'realizada' },
  { id: 'meta-08', status: 'realizada' },
  { id: 'meta-09', status: 'realizada' },
  { id: 'meta-10', status: 'marcada' },
  { id: 'meta-11', status: 'marcada' },
  { id: 'meta-12', status: 'marcada' },
  { id: 'meta-13', status: 'marcada' },
  { id: 'meta-14', status: 'marcada' },
  { id: 'meta-15', status: 'marcada' },
  { id: 'meta-16', status: 'faltante' },
  { id: 'meta-17', status: 'faltante' },
  { id: 'meta-18', status: 'faltante' },
  { id: 'meta-19', status: 'faltante' },
  { id: 'meta-20', status: 'faltante' },
];
