/**
 * Contas por segmento em três carteiras de tamanhos extremos, em unidades, no corte de 2026-09-30.
 * Dado fictício e fixo: nenhuma carteira, segmento, pessoa ou empresa é real.
 * A primeira tem 7 lugares, a segunda tem 900 e a terceira não teve o total informado pela fonte:
 * ali o `total` é `null`, que é ausência de medida e nunca zero.
 */
export interface ChamberGroup {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /**
   * Posição fixa do segmento na paleta (1 a 6): a mesma nos três hemiciclos, porque a cor pertence
   * ao segmento. O dicionário segue a ordem 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Chamber {
  readonly id: string;
  readonly label: string;
  /** Número fixo de lugares do conjunto; `null` quando a fonte não informou. */
  readonly total: number | null;
  /** Os grupos somam o total; lista vazia quando o total não foi informado. */
  readonly groups: readonly ChamberGroup[];
}

export const data: readonly Chamber[] = [
  {
    id: 'contas-chave',
    label: 'Contas-chave',
    total: 7,
    groups: [
      { id: 'varejo', label: 'Varejo', count: 4, slot: 1 },
      { id: 'industria', label: 'Indústria', count: 2, slot: 3 },
      { id: 'servicos', label: 'Serviços', count: 1, slot: 6 },
    ],
  },
  {
    id: 'canal-digital',
    label: 'Canal digital',
    total: 900,
    groups: [
      { id: 'varejo', label: 'Varejo', count: 517, slot: 1 },
      { id: 'industria', label: 'Indústria', count: 268, slot: 3 },
      { id: 'servicos', label: 'Serviços', count: 115, slot: 6 },
    ],
  },
  { id: 'carteira-migrada', label: 'Carteira migrada', total: null, groups: [] },
];

/** O substantivo do que cada lugar conta, no singular e no plural, para as frases de unidade. */
export interface SeatNoun {
  readonly singular: string;
  readonly plural: string;
}

export const seatNoun: SeatNoun = { singular: 'conta', plural: 'contas' };
