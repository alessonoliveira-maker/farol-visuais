/**
 * Leads que passaram por duas origens na mesma jornada de compra, em contagem de leads, entre 11
 * origens com jornada medida e mais uma sem nenhum dado de jornada. Dado fictício e fixo: nenhuma
 * origem, lead ou empresa é real. A relação é simétrica: cada par aparece UMA vez em `data`.
 * `origins` fixa a ordem de leitura e o slot de cor das seis origens coloridas (COR-8: 1, 3, 6, 5,
 * 2, 4); origem com `slot` nulo é agrupada em Outros (COR-4), e `hasJourney` falso a tira do
 * círculo e a conta à parte, em `leads`.
 */
export interface Origin {
  readonly id: string;
  readonly label: string;
  /** Forma para dentro de frase, sem maiúscula no meio da oração. */
  readonly plain: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
  readonly hasJourney: boolean;
  /** Leads da origem sem jornada, só lido quando `hasJourney` é falso. */
  readonly leads: number;
}

export interface OriginPair {
  readonly a: string;
  readonly b: string;
  readonly count: number;
}

export const origins: readonly Origin[] = [
  { id: 'busca-paga', label: 'Busca paga', plain: 'busca paga', slot: 1, hasJourney: true, leads: 0 },
  { id: 'redes', label: 'Redes sociais', plain: 'redes sociais', slot: 3, hasJourney: true, leads: 0 },
  { id: 'organico', label: 'Site orgânico', plain: 'site orgânico', slot: 6, hasJourney: true, leads: 0 },
  { id: 'indicacao', label: 'Indicação', plain: 'indicação', slot: 5, hasJourney: true, leads: 0 },
  { id: 'email', label: 'E-mail', plain: 'e-mail', slot: 2, hasJourney: true, leads: 0 },
  { id: 'evento', label: 'Evento', plain: 'evento', slot: 4, hasJourney: true, leads: 0 },
  { id: 'marketplace', label: 'Marketplace', plain: 'marketplace', slot: null, hasJourney: true, leads: 0 },
  { id: 'webinar', label: 'Webinar', plain: 'webinar', slot: null, hasJourney: true, leads: 0 },
  { id: 'radio', label: 'Rádio', plain: 'rádio', slot: null, hasJourney: true, leads: 0 },
  { id: 'midia-exterior', label: 'Mídia exterior', plain: 'mídia exterior', slot: null, hasJourney: true, leads: 0 },
  { id: 'telemarketing', label: 'Telemarketing', plain: 'telemarketing', slot: null, hasJourney: true, leads: 0 },
  { id: 'balcao', label: 'Balcão presencial', plain: 'balcão presencial', slot: null, hasJourney: false, leads: 37 },
];

/**
 * 29 pares entre as origens com jornada. Os pares dentro de Outros (marketplace com webinar, rádio
 * com mídia exterior, webinar com telemarketing) somem no agrupamento, e os pares abaixo de 10
 * leads ficam sem fita (busca paga com evento, redes sociais com evento, indicação com Outros).
 */
export const data: readonly OriginPair[] = [
  { a: 'busca-paga', b: 'redes', count: 140 },
  { a: 'busca-paga', b: 'organico', count: 96 },
  { a: 'busca-paga', b: 'indicacao', count: 34 },
  { a: 'busca-paga', b: 'email', count: 58 },
  { a: 'busca-paga', b: 'evento', count: 8 },
  { a: 'busca-paga', b: 'marketplace', count: 22 },
  { a: 'busca-paga', b: 'webinar', count: 15 },
  { a: 'busca-paga', b: 'radio', count: 6 },
  { a: 'busca-paga', b: 'midia-exterior', count: 4 },
  { a: 'busca-paga', b: 'telemarketing', count: 9 },
  { a: 'redes', b: 'organico', count: 80 },
  { a: 'redes', b: 'indicacao', count: 52 },
  { a: 'redes', b: 'email', count: 33 },
  { a: 'redes', b: 'evento', count: 9 },
  { a: 'redes', b: 'marketplace', count: 12 },
  { a: 'redes', b: 'webinar', count: 9 },
  { a: 'redes', b: 'radio', count: 5 },
  { a: 'organico', b: 'indicacao', count: 41 },
  { a: 'organico', b: 'email', count: 66 },
  { a: 'organico', b: 'evento', count: 14 },
  { a: 'organico', b: 'webinar', count: 21 },
  { a: 'organico', b: 'marketplace', count: 8 },
  { a: 'indicacao', b: 'email', count: 19 },
  { a: 'indicacao', b: 'evento', count: 38 },
  { a: 'indicacao', b: 'telemarketing', count: 7 },
  { a: 'email', b: 'evento', count: 27 },
  { a: 'email', b: 'webinar', count: 31 },
  { a: 'evento', b: 'webinar', count: 16 },
  { a: 'evento', b: 'midia-exterior', count: 3 },
  { a: 'marketplace', b: 'webinar', count: 13 },
  { a: 'radio', b: 'midia-exterior', count: 7 },
  { a: 'webinar', b: 'telemarketing', count: 5 },
];
