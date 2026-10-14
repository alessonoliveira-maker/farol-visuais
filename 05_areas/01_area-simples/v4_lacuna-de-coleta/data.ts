/**
 * Entradas de leads por semana, contagem simples. Unidade: leads.
 * `leads: null` marca semana sem coleta (falha de captura), distinta de `leads: 0` (semana
 * medida em que não entrou nenhum lead). Dado fictício e fixo: nenhuma pessoa, empresa ou
 * plataforma real.
 */
export interface WeeklyLeads {
  readonly week: string;
  readonly leads: number | null;
}

export const data: readonly WeeklyLeads[] = [
  { week: '2026-04-06', leads: 34 },
  { week: '2026-04-13', leads: 29 },
  { week: '2026-04-20', leads: 41 },
  { week: '2026-04-27', leads: 37 },
  { week: '2026-05-04', leads: 19 },
  { week: '2026-05-11', leads: 0 },
  { week: '2026-05-18', leads: 26 },
  { week: '2026-05-25', leads: 33 },
  { week: '2026-06-01', leads: 30 },
  { week: '2026-06-08', leads: 38 },
  { week: '2026-06-15', leads: null },
  { week: '2026-06-22', leads: null },
  { week: '2026-06-29', leads: null },
  { week: '2026-07-06', leads: 44 },
  { week: '2026-07-13', leads: 47 },
  { week: '2026-07-20', leads: 39 },
  { week: '2026-07-27', leads: 42 },
  { week: '2026-08-03', leads: 36 },
  { week: '2026-08-10', leads: 48 },
  { week: '2026-08-17', leads: 45 },
];
