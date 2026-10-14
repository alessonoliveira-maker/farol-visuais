/**
 * Leads recebidos por mês e quantos deles foram qualificados pelo critério de SDR, de janeiro a
 * agosto de 2026. Dado fictício e fixo: nenhum nome cita marca ou campanha real.
 */
export interface MonthlyLeadQuality {
  readonly month: string;
  readonly leads: number;
  readonly qualifiedLeads: number;
}

export const data: readonly MonthlyLeadQuality[] = [
  { month: '2026-01', leads: 128, qualifiedLeads: 34 },
  { month: '2026-02', leads: 145, qualifiedLeads: 42 },
  { month: '2026-03', leads: 162, qualifiedLeads: 33 },
  { month: '2026-04', leads: 189, qualifiedLeads: 58 },
  { month: '2026-05', leads: 210, qualifiedLeads: 71 },
  { month: '2026-06', leads: 246, qualifiedLeads: 79 },
  { month: '2026-07', leads: 268, qualifiedLeads: 96 },
  { month: '2026-08', leads: 301, qualifiedLeads: 118 },
];
