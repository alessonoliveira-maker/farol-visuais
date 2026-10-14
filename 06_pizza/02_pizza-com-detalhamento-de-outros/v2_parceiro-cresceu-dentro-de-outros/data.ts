/**
 * Leads do mês por origem, em contagem de leads, com o detalhe da cauda agrupada em "Outros".
 * Dado fictício e fixo: nenhuma origem é empresa real.
 *
 * A regra da cauda mora NO DADO, não num comentário: origem com menos de `tailMaxLeads` leads no
 * mês entra em "Outros". É isso que permite a peça escrever na tela o critério de agrupamento e a
 * contagem de origens que ele reúne, em vez de deixar o leitor adivinhar o que "Outros" esconde.
 */
export interface LeadOriginNamed {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  /** Slot categórico fixo (índice em CHART_SERIES_COLORS), na ordem da COR-8. */
  readonly slot: number;
}

export interface LeadOriginTail {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  /** Leads da mesma origem no mês anterior, a base nomeada que a NUM-4 exige na anotação. */
  readonly previousLeads: number;
}

export interface PartnerGrowthData {
  readonly named: readonly LeadOriginNamed[];
  readonly tail: readonly LeadOriginTail[];
  /** Teto da cauda: abaixo deste número de leads a origem vai para "Outros". */
  readonly tailMaxLeads: number;
  /** A origem da cauda que mudou de patamar e por isso acende no painel de detalhe. */
  readonly highlightId: string;
  readonly month: string;
  readonly previousMonth: string;
}

export const data: PartnerGrowthData = {
  named: [
    { id: 'site-organico', name: 'Site orgânico', leads: 142, slot: 2 },
    { id: 'indicacao', name: 'Indicação', leads: 96, slot: 5 },
    { id: 'evento', name: 'Evento', leads: 54, slot: 4 },
    { id: 'midia-paga', name: 'Mídia paga', leads: 47, slot: 1 },
  ],
  tail: [
    { id: 'parceiro', name: 'Parceiro', leads: 18, previousLeads: 6 },
    { id: 'podcast', name: 'Podcast', leads: 13, previousLeads: 11 },
    { id: 'imprensa', name: 'Imprensa', leads: 9, previousLeads: 12 },
    { id: 'cold-email', name: 'Cold email', leads: 6, previousLeads: 8 },
  ],
  tailMaxLeads: 20,
  highlightId: 'parceiro',
  month: '2026-08',
  previousMonth: '2026-07',
};
