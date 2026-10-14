/**
 * Leads entrados por mês, nos últimos 12 meses. O último mês da série é o mês corrente e está
 * parcial: `leads` conta só o que já entrou até o dia de corte, não o mês inteiro. Unidade
 * "leads". Dado fictício e fixo: nenhuma pessoa ou empresa real é citada.
 */
export interface MonthlyLeadsPartial {
  readonly month: string;
  readonly leads: number;
  readonly current: boolean;
}

export const data: readonly MonthlyLeadsPartial[] = [
  { month: '2025-10', leads: 210, current: false },
  { month: '2025-11', leads: 260, current: false },
  { month: '2025-12', leads: 150, current: false },
  { month: '2026-01', leads: 230, current: false },
  { month: '2026-02', leads: 245, current: false },
  { month: '2026-03', leads: 300, current: false },
  { month: '2026-04', leads: 275, current: false },
  { month: '2026-05', leads: 320, current: false },
  { month: '2026-06', leads: 290, current: false },
  { month: '2026-07', leads: 265, current: false },
  { month: '2026-08', leads: 240, current: false },
  { month: '2026-09', leads: 96, current: true },
];

/** Dias já decorridos e dias no mês corrente, para calcular o ritmo e o restante projetado. */
export const daysElapsed = 14;
export const daysInMonth = 30;
