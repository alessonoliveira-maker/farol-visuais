/**
 * Leads novos do mês de 2026-09 por origem, em contagem de leads.
 * Dado fictício e fixo: nenhuma origem, campanha ou pessoa corresponde a caso real.
 */
export interface LeadOrigin {
  readonly id: string;
  readonly name: string;
  readonly count: number;
  /** `false` só na linha de ausência: ela sai da ordenação, vai por último e desenha vazada. */
  readonly declared: boolean;
  /**
   * Slot categórico fixo (COR-8): a cor segue a categoria, nunca a posição depois de ordenar.
   * Ausente na linha de ausência, que não tem preenchimento nenhum.
   */
  readonly slot?: number;
}

export const data: readonly LeadOrigin[] = [
  { id: 'busca', name: 'Busca orgânica', count: 150, declared: true, slot: 0 },
  { id: 'midia', name: 'Mídia paga', count: 125, declared: true, slot: 1 },
  { id: 'indicacao', name: 'Indicação', count: 10, declared: true, slot: 2 },
  { id: 'evento', name: 'Evento e webinar', count: 7, declared: true, slot: 3 },
  { id: 'sem-origem', name: 'Sem origem declarada', count: 48, declared: false },
];
