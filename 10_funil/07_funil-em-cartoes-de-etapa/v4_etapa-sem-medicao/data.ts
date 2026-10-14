/**
 * O mesmo funil de mídia paga numa plataforma sem o evento de conversão de lead configurado:
 * a etapa "Leads" não tem medição, e as duas taxas vizinhas a ela ficam sem base para o
 * cálculo. Dado fictício e fixo; `value: null` é a etapa sem medição, nunca zero.
 */
export interface FunnelCardStageMaybe {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly unit: string;
}

export interface MediaFunnelWithGap {
  readonly month: string;
  readonly platform: string;
  readonly stages: readonly FunnelCardStageMaybe[];
  readonly missingReason: string;
}

export const data: MediaFunnelWithGap = {
  month: '2026-08',
  platform: 'Rede profissional',
  stages: [
    { id: 'impressoes', label: 'Impressões', value: 612_000, unit: 'impressões' },
    { id: 'cliques', label: 'Cliques', value: 9_400, unit: 'cliques' },
    { id: 'leads', label: 'Leads', value: null, unit: 'leads' },
    { id: 'leads-qualificados', label: 'Leads qualificados', value: 41, unit: 'leads qualificados' },
  ],
  missingReason: 'evento de conversão de lead não configurado nesta plataforma',
};
