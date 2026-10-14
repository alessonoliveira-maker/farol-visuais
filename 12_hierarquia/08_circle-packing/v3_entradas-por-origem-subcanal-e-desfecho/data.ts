/**
 * Entradas de pré-vendas de 2026-08 em três níveis: origem, subcanal e desfecho. O valor de cada
 * folha é a contagem de entradas com aquele desfecho dentro do subcanal. Dado fictício e fixo:
 * nenhuma origem, subcanal, plataforma ou pessoa é real.
 */
export type OutcomeKind = 'convertida' | 'aberta' | 'descartada';

export interface OutcomeLeaf {
  readonly id: string;
  readonly kind: OutcomeKind;
  readonly entries: number;
}

export interface SubchannelGroup {
  readonly id: string;
  readonly label: string;
  readonly children: readonly OutcomeLeaf[];
}

export interface OriginGroup {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa da origem na paleta categórica (`--chart-1` a `--chart-6`), na ordem 1, 3, 6, 5
   * da COR-8. A cor pertence à origem e não à posição no ranking (COR-3). Os slots 2 e 4 ficam de
   * fora porque esta versão pinta desfecho semântico no corpo.
   */
  readonly slot: 1 | 3 | 5 | 6;
  readonly children: readonly SubchannelGroup[];
}

/** A ordem dos desfechos na legenda e nas colunas da tabela, do melhor para o pior. */
export const outcomes: readonly { readonly kind: OutcomeKind; readonly label: string }[] = [
  { kind: 'convertida', label: 'Convertida' },
  { kind: 'aberta', label: 'Em aberto' },
  { kind: 'descartada', label: 'Descartada' },
];

export const data: readonly OriginGroup[] = [
  {
    id: 'inbound',
    label: 'Inbound',
    slot: 1,
    children: [
      {
        id: 'formulario',
        label: 'Formulário',
        children: [
          { id: 'formulario-convertida', kind: 'convertida', entries: 14 },
          { id: 'formulario-aberta', kind: 'aberta', entries: 22 },
          { id: 'formulario-descartada', kind: 'descartada', entries: 61 },
        ],
      },
      {
        id: 'mensageria',
        label: 'Mensageria',
        children: [
          { id: 'mensageria-convertida', kind: 'convertida', entries: 9 },
          { id: 'mensageria-aberta', kind: 'aberta', entries: 15 },
          { id: 'mensageria-descartada', kind: 'descartada', entries: 28 },
        ],
      },
      {
        id: 'indicacao',
        label: 'Indicação',
        children: [
          { id: 'indicacao-convertida', kind: 'convertida', entries: 12 },
          { id: 'indicacao-aberta', kind: 'aberta', entries: 5 },
          { id: 'indicacao-descartada', kind: 'descartada', entries: 6 },
        ],
      },
    ],
  },
  {
    id: 'prospeccao-ativa',
    label: 'Prospecção ativa',
    slot: 3,
    children: [
      {
        id: 'lista-fria',
        label: 'Lista fria',
        children: [
          { id: 'lista-fria-convertida', kind: 'convertida', entries: 4 },
          { id: 'lista-fria-aberta', kind: 'aberta', entries: 18 },
          { id: 'lista-fria-descartada', kind: 'descartada', entries: 96 },
        ],
      },
      {
        id: 'evento',
        label: 'Evento',
        children: [
          { id: 'evento-convertida', kind: 'convertida', entries: 7 },
          { id: 'evento-aberta', kind: 'aberta', entries: 8 },
          { id: 'evento-descartada', kind: 'descartada', entries: 11 },
        ],
      },
    ],
  },
];
