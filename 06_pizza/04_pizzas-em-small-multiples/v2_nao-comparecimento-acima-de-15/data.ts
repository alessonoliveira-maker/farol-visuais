/**
 * Agendas comerciais de quatro semanas seguidas, separadas em duas partes: quem não compareceu e
 * quem compareceu ou remarcou. A unidade é a agenda marcada.
 * Dado fictício e fixo: nenhuma semana corresponde a uma semana real de calendário.
 */
export interface WeeklyNoShow {
  readonly weekId: string;
  readonly weekLabel: string;
  /** Primeiro dia da semana, YYYY-MM-DD. */
  readonly startDate: string;
  /** Agendas em que o lead não apareceu. */
  readonly noShow: number;
  /** Agendas realizadas somadas às remarcadas para outra data. */
  readonly attended: number;
}

export const data: readonly WeeklyNoShow[] = [
  { weekId: 'sem-1', weekLabel: 'Sem 1', startDate: '2026-08-03', noShow: 3, attended: 21 },
  { weekId: 'sem-2', weekLabel: 'Sem 2', startDate: '2026-08-10', noShow: 5, attended: 22 },
  { weekId: 'sem-3', weekLabel: 'Sem 3', startDate: '2026-08-17', noShow: 4, attended: 28 },
  { weekId: 'sem-4', weekLabel: 'Sem 4', startDate: '2026-08-24', noShow: 2, attended: 23 },
];

/** Teto aceito de não comparecimento, em fração das agendas da semana. */
export const limit = 0.15;
