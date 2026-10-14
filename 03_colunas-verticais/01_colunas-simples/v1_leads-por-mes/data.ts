/**
 * Leads que entraram por mês, nos últimos 12 meses do calendário. Contagem de leads, unidade
 * "leads". Março de 2026 falta na origem (caso difícil de ausência, EIX-10): o componente
 * reconstrói a sequência completa e marca o mês sem dado, nunca o zera. Dado fictício e fixo:
 * nenhum nome de pessoa, empresa ou plataforma real.
 */
export interface MonthlyLeads {
  readonly month: string;
  readonly leads: number;
}

export const data: readonly MonthlyLeads[] = [
  { month: '2025-10', leads: 132 },
  { month: '2025-11', leads: 148 },
  { month: '2025-12', leads: 121 },
  { month: '2026-01', leads: 139 },
  { month: '2026-02', leads: 156 },
  { month: '2026-04', leads: 163 },
  { month: '2026-05', leads: 189 },
  { month: '2026-06', leads: 197 },
  { month: '2026-07', leads: 214 },
  { month: '2026-08', leads: 182 },
  { month: '2026-09', leads: 176 },
];
