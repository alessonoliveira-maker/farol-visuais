/**
 * Leads mensais por plataforma de mídia paga, jan a jun de 2026. Contagem de leads.
 * Dado fictício e fixo: nenhuma plataforma, pessoa ou empresa real.
 */
export interface MonthlyLeadsByPlatform {
  readonly month: string;
  readonly paidSearch: number;
  readonly video: number;
  readonly social: number;
}

export const data: readonly MonthlyLeadsByPlatform[] = [
  { month: '2026-01', paidSearch: 210, video: 95, social: 140 },
  { month: '2026-02', paidSearch: 225, video: 102, social: 138 },
  { month: '2026-03', paidSearch: 198, video: 110, social: 150 },
  { month: '2026-04', paidSearch: 240, video: 120, social: 162 },
  { month: '2026-05', paidSearch: 232, video: 134, social: 171 },
  { month: '2026-06', paidSearch: 255, video: 140, social: 180 },
];
