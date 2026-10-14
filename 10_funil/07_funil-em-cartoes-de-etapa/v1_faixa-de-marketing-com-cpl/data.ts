/**
 * Funil de mídia paga do mês em quatro etapas, de impressões a lead qualificado, com o
 * investimento total e o custo por lead em dois pontos de corte. Dado fictício e fixo.
 */
export interface FunnelCardStage {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
}

export interface CostAtStage {
  readonly label: string;
  readonly value: number;
}

export interface MediaFunnelKpi {
  readonly month: string;
  readonly stages: readonly FunnelCardStage[];
  readonly investment: number;
  readonly costPerStage: readonly CostAtStage[];
}

export const data: MediaFunnelKpi = {
  month: '2026-08',
  stages: [
    { id: 'impressoes', label: 'Impressões', value: 2_400_000, unit: 'impressões' },
    { id: 'cliques', label: 'Cliques', value: 38_600, unit: 'cliques' },
    { id: 'leads', label: 'Leads', value: 1_240, unit: 'leads' },
    { id: 'leads-qualificados', label: 'Leads qualificados', value: 318, unit: 'leads qualificados' },
  ],
  investment: 119_000,
  costPerStage: [
    { label: 'CPL', value: 96 },
    { label: 'CPL qualificado', value: 374 },
  ],
};
