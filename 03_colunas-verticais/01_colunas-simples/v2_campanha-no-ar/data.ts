/**
 * Leads que entraram por semana, em 16 semanas corridas. Contagem de leads, unidade "leads".
 * Dado fictício e fixo: nenhuma plataforma ou campanha real é citada.
 */
export interface WeeklyLeads {
  readonly week: string;
  readonly weekStart: string;
  readonly leads: number;
}

export const data: readonly WeeklyLeads[] = [
  { week: 'S01', weekStart: '2026-04-27', leads: 44 },
  { week: 'S02', weekStart: '2026-05-04', leads: 41 },
  { week: 'S03', weekStart: '2026-05-11', leads: 47 },
  { week: 'S04', weekStart: '2026-05-18', leads: 39 },
  { week: 'S05', weekStart: '2026-05-25', leads: 52 },
  { week: 'S06', weekStart: '2026-06-01', leads: 46 },
  { week: 'S07', weekStart: '2026-06-08', leads: 71 },
  { week: 'S08', weekStart: '2026-06-15', leads: 83 },
  { week: 'S09', weekStart: '2026-06-22', leads: 91 },
  { week: 'S10', weekStart: '2026-06-29', leads: 88 },
  { week: 'S11', weekStart: '2026-07-06', leads: 79 },
  { week: 'S12', weekStart: '2026-07-13', leads: 74 },
  { week: 'S13', weekStart: '2026-07-20', leads: 58 },
  { week: 'S14', weekStart: '2026-07-27', leads: 53 },
  { week: 'S15', weekStart: '2026-08-03', leads: 49 },
  { week: 'S16', weekStart: '2026-08-10', leads: 51 },
];

/** Janela em que a campanha esteve no ar: da semana de estreia até a última semana ativa. */
export const campaignWindow = { startWeek: 'S07', endWeek: 'S12' } as const;
