/**
 * Entradas de leads por semana na pré-vendas, em contagem, nas últimas 16 semanas. Dado fictício e
 * fixo. Cinco semanas fechadas passam do teto, uma fecha exatamente nele (60, sem estouro) e a
 * última semana ainda está em curso: o valor dela é parcial e não entra na contagem de estouros.
 */
export interface WeeklyIntake {
  readonly id: string;
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly week: string;
  /** Entradas contadas na semana. Na semana em curso, até `partialUntil`. */
  readonly entries: number;
  /** Último dia contado da semana em curso; ausente em semana fechada. */
  readonly partialUntil?: string;
}

/** Teto medido de capacidade da equipe, em entradas por semana. */
export const WEEKLY_CAP = 60;

export const data: readonly WeeklyIntake[] = [
  { id: 'sem-01', week: '2026-06-15', entries: 44 },
  { id: 'sem-02', week: '2026-06-22', entries: 52 },
  { id: 'sem-03', week: '2026-06-29', entries: 47 },
  { id: 'sem-04', week: '2026-07-06', entries: 63 },
  { id: 'sem-05', week: '2026-07-13', entries: 60 },
  { id: 'sem-06', week: '2026-07-20', entries: 71 },
  { id: 'sem-07', week: '2026-07-27', entries: 55 },
  { id: 'sem-08', week: '2026-08-03', entries: 49 },
  { id: 'sem-09', week: '2026-08-10', entries: 62 },
  { id: 'sem-10', week: '2026-08-17', entries: 68 },
  { id: 'sem-11', week: '2026-08-24', entries: 57 },
  { id: 'sem-12', week: '2026-08-31', entries: 53 },
  { id: 'sem-13', week: '2026-09-07', entries: 46 },
  { id: 'sem-14', week: '2026-09-14', entries: 50 },
  { id: 'sem-15', week: '2026-09-21', entries: 66 },
  { id: 'sem-16', week: '2026-09-28', entries: 31, partialUntil: '2026-10-01' },
];
