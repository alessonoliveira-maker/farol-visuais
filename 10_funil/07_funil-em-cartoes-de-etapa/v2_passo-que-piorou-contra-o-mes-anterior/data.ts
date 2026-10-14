/**
 * As mesmas quatro etapas de mídia paga do mês atual contra o mês anterior, para achar a
 * passagem cuja taxa piorou. Dado fictício e fixo.
 */
export interface FunnelCardStagePeriod {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly current: number;
  readonly previous: number;
}

export interface MediaFunnelComparison {
  readonly currentMonth: string;
  readonly previousMonth: string;
  readonly stages: readonly FunnelCardStagePeriod[];
  /** Queda de taxa de passo, em pontos percentuais, a partir da qual o chip vira alerta. */
  readonly worsenedThresholdPoints: number;
}

export const data: MediaFunnelComparison = {
  currentMonth: '2026-08',
  previousMonth: '2026-07',
  stages: [
    { id: 'impressoes', label: 'Impressões', unit: 'impressões', current: 2_400_000, previous: 2_180_000 },
    { id: 'cliques', label: 'Cliques', unit: 'cliques', current: 38_600, previous: 35_900 },
    { id: 'leads', label: 'Leads', unit: 'leads', current: 1_240, previous: 1_105 },
    { id: 'leads-qualificados', label: 'Leads qualificados', unit: 'leads qualificados', current: 318, previous: 345 },
  ],
  worsenedThresholdPoints: 5,
};
