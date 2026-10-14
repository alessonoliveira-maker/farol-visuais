/**
 * Leads mensais de duas plataformas de mídia paga, jan a jun de 2026. `newcomer` é `null` antes
 * da estreia da plataforma, em 2026-05. Contagem de leads.
 * Dado fictício e fixo: nenhuma plataforma, pessoa ou empresa real.
 */
export interface MonthlyLeadsTwoPlatforms {
  readonly month: string;
  readonly established: number;
  readonly newcomer: number | null;
}

export const data: readonly MonthlyLeadsTwoPlatforms[] = [
  { month: '2026-01', established: 130, newcomer: null },
  { month: '2026-02', established: 142, newcomer: null },
  { month: '2026-03', established: 138, newcomer: null },
  { month: '2026-04', established: 151, newcomer: null },
  { month: '2026-05', established: 160, newcomer: 54 },
  { month: '2026-06', established: 158, newcomer: 0 },
];

export const debutMonth = '2026-05';
