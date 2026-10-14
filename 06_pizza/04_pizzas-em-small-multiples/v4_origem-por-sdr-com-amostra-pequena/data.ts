/**
 * Origem dos leads recebidos no mês por pessoa da pré vendas, em contagem de leads.
 * A ordem das origens é fixa e a mesma em toda pessoa, e a categoria de ausência fecha a lista.
 * Dado fictício e fixo: nenhuma pessoa e nenhuma origem correspondem a alguém ou a algo real.
 */
export interface OriginCount {
  readonly id: string;
  readonly name: string;
  /** Slot categórico fixo da paleta, na ordem da COR-8. A categoria de ausência não recebe slot. */
  readonly slot?: number;
  /** Categoria de ausência: desenhada vazada e sempre por último. */
  readonly missing?: boolean;
  readonly count: number;
}

export interface SdrOrigins {
  readonly sdrId: string;
  readonly sdrLabel: string;
  readonly origins: readonly OriginCount[];
}

export const data: readonly SdrOrigins[] = [
  {
    sdrId: 'sdr-01',
    sdrLabel: 'SDR 01',
    origins: [
      { id: 'indicacao', name: 'Indicação', slot: 1, count: 9 },
      { id: 'midia-paga', name: 'Mídia paga', slot: 3, count: 8 },
      { id: 'base-clientes', name: 'Base de clientes', slot: 6, count: 5 },
      { id: 'sem-origem', name: 'Sem origem declarada', missing: true, count: 2 },
    ],
  },
  {
    sdrId: 'sdr-02',
    sdrLabel: 'SDR 02',
    origins: [
      { id: 'indicacao', name: 'Indicação', slot: 1, count: 7 },
      { id: 'midia-paga', name: 'Mídia paga', slot: 3, count: 15 },
      { id: 'base-clientes', name: 'Base de clientes', slot: 6, count: 6 },
      { id: 'sem-origem', name: 'Sem origem declarada', missing: true, count: 3 },
    ],
  },
  {
    sdrId: 'sdr-03',
    sdrLabel: 'SDR 03',
    origins: [
      { id: 'indicacao', name: 'Indicação', slot: 1, count: 3 },
      { id: 'midia-paga', name: 'Mídia paga', slot: 3, count: 2 },
      { id: 'base-clientes', name: 'Base de clientes', slot: 6, count: 1 },
      /* Zero medido, não ausência de medida: a contagem sai escrita como 0 e nenhuma cunha é
         desenhada, porque cunha de área nula não existe (EST-3). */
      { id: 'sem-origem', name: 'Sem origem declarada', missing: true, count: 0 },
    ],
  },
  {
    sdrId: 'sdr-04',
    sdrLabel: 'SDR 04',
    origins: [
      { id: 'indicacao', name: 'Indicação', slot: 1, count: 6 },
      { id: 'midia-paga', name: 'Mídia paga', slot: 3, count: 7 },
      { id: 'base-clientes', name: 'Base de clientes', slot: 6, count: 4 },
      { id: 'sem-origem', name: 'Sem origem declarada', missing: true, count: 2 },
    ],
  },
];
