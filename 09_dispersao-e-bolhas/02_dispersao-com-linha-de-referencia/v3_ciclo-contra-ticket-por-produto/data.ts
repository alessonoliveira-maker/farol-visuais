/**
 * Oportunidades ganhas de dois produtos no último ano: o ticket fechado, em reais, e o ciclo de
 * venda, em dias corridos entre a criação e o fechamento. Oportunidade sem data de fechamento
 * registrada fica com o ciclo em `null`, que é ausência de medida e não ciclo de zero dia.
 * O `slot` é a cor categórica do produto, fixada aqui para a cor pertencer à categoria e não à
 * posição na lista.
 * Dado fictício e fixo: nenhum produto ou empresa corresponde a um real.
 */
export interface ProductOpportunity {
  readonly id: string;
  readonly ticketReais: number;
  readonly cicloDias: number | null;
}

export interface ProductCycleTicket {
  readonly id: string;
  readonly rotulo: string;
  readonly slot: number;
  readonly oportunidades: readonly ProductOpportunity[];
}

export const data: readonly ProductCycleTicket[] = [
  {
    id: 'produto-a',
    rotulo: 'Produto A',
    slot: 1,
    oportunidades: [
      { id: 'a-01', ticketReais: 24_000, cicloDias: 26 },
      { id: 'a-02', ticketReais: 32_000, cicloDias: 22 },
      { id: 'a-03', ticketReais: 41_000, cicloDias: 34 },
      { id: 'a-04', ticketReais: 48_000, cicloDias: 31 },
      { id: 'a-05', ticketReais: 57_000, cicloDias: 40 },
      { id: 'a-06', ticketReais: 66_000, cicloDias: 33 },
      { id: 'a-07', ticketReais: 74_000, cicloDias: 45 },
      { id: 'a-08', ticketReais: 83_000, cicloDias: 38 },
      { id: 'a-09', ticketReais: 92_000, cicloDias: 49 },
      { id: 'a-10', ticketReais: 104_000, cicloDias: 44 },
      { id: 'a-11', ticketReais: 113_000, cicloDias: 57 },
      { id: 'a-12', ticketReais: 126_000, cicloDias: 52 },
      { id: 'a-13', ticketReais: 138_000, cicloDias: 61 },
      { id: 'a-14', ticketReais: 149_000, cicloDias: 55 },
      { id: 'a-15', ticketReais: 162_000, cicloDias: 70 },
      { id: 'a-16', ticketReais: 174_000, cicloDias: 63 },
      { id: 'a-17', ticketReais: 188_000, cicloDias: 74 },
      { id: 'a-18', ticketReais: 203_000, cicloDias: 68 },
      { id: 'a-19', ticketReais: 218_000, cicloDias: 82 },
      { id: 'a-20', ticketReais: 234_000, cicloDias: 76 },
      { id: 'a-21', ticketReais: 251_000, cicloDias: 88 },
      { id: 'a-22', ticketReais: 268_000, cicloDias: 81 },
      { id: 'a-23', ticketReais: 287_000, cicloDias: 95 },
      { id: 'a-24', ticketReais: 308_000, cicloDias: 90 },
      { id: 'a-25', ticketReais: 96_000, cicloDias: null },
      { id: 'a-26', ticketReais: 221_000, cicloDias: null },
    ],
  },
  {
    id: 'produto-b',
    rotulo: 'Produto B',
    slot: 3,
    oportunidades: [
      { id: 'b-01', ticketReais: 28_000, cicloDias: 34 },
      { id: 'b-02', ticketReais: 36_000, cicloDias: 27 },
      { id: 'b-03', ticketReais: 45_000, cicloDias: 38 },
      { id: 'b-04', ticketReais: 54_000, cicloDias: 31 },
      { id: 'b-05', ticketReais: 63_000, cicloDias: 42 },
      { id: 'b-06', ticketReais: 72_000, cicloDias: 35 },
      { id: 'b-07', ticketReais: 84_000, cicloDias: 48 },
      { id: 'b-08', ticketReais: 95_000, cicloDias: 41 },
      { id: 'b-09', ticketReais: 107_000, cicloDias: 52 },
      { id: 'b-10', ticketReais: 119_000, cicloDias: 44 },
      { id: 'b-11', ticketReais: 132_000, cicloDias: 55 },
      { id: 'b-12', ticketReais: 145_000, cicloDias: 47 },
      { id: 'b-13', ticketReais: 158_000, cicloDias: 58 },
      { id: 'b-14', ticketReais: 172_000, cicloDias: 50 },
      { id: 'b-15', ticketReais: 186_000, cicloDias: 61 },
      { id: 'b-16', ticketReais: 201_000, cicloDias: 53 },
      { id: 'b-17', ticketReais: 217_000, cicloDias: 63 },
      { id: 'b-18', ticketReais: 233_000, cicloDias: 56 },
      { id: 'b-19', ticketReais: 250_000, cicloDias: 66 },
      { id: 'b-20', ticketReais: 268_000, cicloDias: 58 },
      { id: 'b-21', ticketReais: 286_000, cicloDias: 68 },
      { id: 'b-22', ticketReais: 305_000, cicloDias: 61 },
      { id: 'b-23', ticketReais: 141_000, cicloDias: null },
    ],
  },
];
