/**
 * Leads do mês por origem, em contagem de leads.
 * Dado fictício e fixo: nenhuma origem é empresa real. As quatro principais somam 339 leads e a
 * cauda agrupada em "Outros" soma 51, distribuídos em quatro origens menores.
 */
export interface LeadOriginMain {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  /** Slot categórico fixo (índice em CHART_SERIES_COLORS), na ordem da COR-8. */
  readonly slot: number;
}

export interface LeadOriginDetail {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
}

export interface LeadOriginsData {
  readonly main: readonly LeadOriginMain[];
  readonly outrosDetail: readonly LeadOriginDetail[];
}

export const data: LeadOriginsData = {
  main: [
    { id: 'site-organico', name: 'Site orgânico', leads: 142, slot: 0 },
    { id: 'indicacao', name: 'Indicação', leads: 96, slot: 1 },
    { id: 'evento', name: 'Evento', leads: 54, slot: 2 },
    { id: 'midia-paga', name: 'Mídia paga', leads: 47, slot: 3 },
  ],
  outrosDetail: [
    { id: 'parceiro', name: 'Parceiro', leads: 21 },
    { id: 'podcast', name: 'Podcast', leads: 14 },
    { id: 'imprensa', name: 'Imprensa', leads: 9 },
    { id: 'cold-email', name: 'Cold email', leads: 7 },
  ],
};
