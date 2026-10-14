/**
 * Agendas de primeira reunião marcadas pela pré-vendas e agendas que de fato aconteceram, por mês,
 * de 2026-03 a 2026-08. Contagem de reuniões.
 * Dado fictício e fixo: nenhuma pessoa nem empresa real.
 */
export interface MonthlyMeetings {
  readonly month: string;
  /** Agendas marcadas no mês. */
  readonly scheduled: number;
  /** Agendas marcadas que aconteceram; nunca maior que `scheduled`. */
  readonly held: number;
}

export const data: readonly MonthlyMeetings[] = [
  { month: '2026-03', scheduled: 52, held: 41 },
  { month: '2026-04', scheduled: 61, held: 39 },
  { month: '2026-05', scheduled: 58, held: 44 },
  { month: '2026-06', scheduled: 49, held: 22 },
  { month: '2026-07', scheduled: 66, held: 51 },
  { month: '2026-08', scheduled: 60, held: 47 },
];
