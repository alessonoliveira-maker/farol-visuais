/**
 * As 20 agendas da meta semanal de uma SDR, uma unidade por segmento, com o status até
 * quarta-feira, 2026-09-09. Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface WeeklyGoalUnit {
  readonly id: string;
  readonly done: boolean;
}

export const sdrName = 'Marina T.';
export const weekLabel = 'até quarta-feira, 2026-09-09';

export const data: readonly WeeklyGoalUnit[] = [
  { id: 'meta-01', done: true },
  { id: 'meta-02', done: true },
  { id: 'meta-03', done: true },
  { id: 'meta-04', done: true },
  { id: 'meta-05', done: true },
  { id: 'meta-06', done: true },
  { id: 'meta-07', done: true },
  { id: 'meta-08', done: true },
  { id: 'meta-09', done: true },
  { id: 'meta-10', done: true },
  { id: 'meta-11', done: true },
  { id: 'meta-12', done: true },
  { id: 'meta-13', done: false },
  { id: 'meta-14', done: false },
  { id: 'meta-15', done: false },
  { id: 'meta-16', done: false },
  { id: 'meta-17', done: false },
  { id: 'meta-18', done: false },
  { id: 'meta-19', done: false },
  { id: 'meta-20', done: false },
];
