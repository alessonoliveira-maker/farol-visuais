/**
 * Entradas de leads por mês, contagem simples. Unidade: leads.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export interface MonthlyLeads {
  readonly month: string;
  readonly leads: number;
}

export const data: readonly MonthlyLeads[] = [
  { month: '2025-11', leads: 96 },
  { month: '2025-12', leads: 104 },
  { month: '2026-01', leads: 118 },
  { month: '2026-02', leads: 135 },
  { month: '2026-03', leads: 122 },
  { month: '2026-04', leads: 142 },
  { month: '2026-05', leads: 158 },
  { month: '2026-06', leads: 171 },
  { month: '2026-07', leads: 185 },
  { month: '2026-08', leads: 162 },
  { month: '2026-09', leads: 178 },
  { month: '2026-10', leads: 194 },
  { month: '2026-11', leads: 207 },
  { month: '2026-12', leads: 221 },
];
