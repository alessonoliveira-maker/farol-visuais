/**
 * Passagem de 6 oportunidades entre as funções do processo comercial em 2026-10. Cada etapa é um
 * período de posse numa função, com `from` e `to` inclusivos em YYYY-MM-DD. A espera é o intervalo
 * entre o fim de uma posse e o começo da seguinte. Dado fictício e fixo: nenhuma empresa é real.
 *
 * Casos que o desenho precisa aguentar: a oportunidade que mais esperou (dividida em três
 * esperas), passagens sem nenhum dia de espera (zero medido, não ausência), uma oportunidade que
 * ficou só em duas funções e ainda não chegou às outras, e posses simultâneas na mesma função.
 */
export interface HandoffLane {
  readonly id: string;
  readonly name: string;
}

export interface Stage {
  readonly laneId: string;
  readonly from: string;
  readonly to: string;
}

export interface Opportunity {
  readonly id: string;
  readonly name: string;
  /** Slot da paleta categórica, de 1 a 6. A cor é da oportunidade, não da posição na lista. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly stages: readonly Stage[];
}

export interface HandoffBoard {
  readonly lanes: readonly HandoffLane[];
  readonly opportunities: readonly Opportunity[];
  readonly windowStart: string;
  readonly windowEnd: string;
}

/** A oportunidade que acende por padrão: a que mais esperou entre uma função e outra. */
export const focusId = 'op-leste';

export const data: HandoffBoard = {
  windowStart: '2026-10-01',
  windowEnd: '2026-10-31',
  lanes: [
    { id: 'marketing', name: 'Marketing' },
    { id: 'pre-vendas', name: 'Pré-vendas' },
    { id: 'executivo', name: 'Executivo' },
    { id: 'operacoes', name: 'Operações' },
  ],
  opportunities: [
    {
      id: 'op-norte',
      name: 'Distribuidora Norte',
      slot: 1,
      stages: [
        { laneId: 'marketing', from: '2026-10-01', to: '2026-10-03' },
        { laneId: 'pre-vendas', from: '2026-10-06', to: '2026-10-10' },
        { laneId: 'executivo', from: '2026-10-13', to: '2026-10-21' },
        { laneId: 'operacoes', from: '2026-10-23', to: '2026-10-29' },
      ],
    },
    {
      id: 'op-leste',
      name: 'Transportadora Leste',
      slot: 3,
      stages: [
        { laneId: 'marketing', from: '2026-10-02', to: '2026-10-06' },
        { laneId: 'pre-vendas', from: '2026-10-13', to: '2026-10-16' },
        { laneId: 'executivo', from: '2026-10-22', to: '2026-10-26' },
        { laneId: 'operacoes', from: '2026-10-30', to: '2026-10-31' },
      ],
    },
    {
      id: 'op-sul',
      name: 'Construtora Sul',
      slot: 6,
      stages: [
        { laneId: 'marketing', from: '2026-10-05', to: '2026-10-07' },
        { laneId: 'pre-vendas', from: '2026-10-08', to: '2026-10-12' },
        { laneId: 'executivo', from: '2026-10-15', to: '2026-10-23' },
        { laneId: 'operacoes', from: '2026-10-24', to: '2026-10-30' },
      ],
    },
    {
      id: 'op-central',
      name: 'Atacado Central',
      slot: 5,
      stages: [
        { laneId: 'marketing', from: '2026-10-06', to: '2026-10-09' },
        { laneId: 'pre-vendas', from: '2026-10-12', to: '2026-10-14' },
        { laneId: 'executivo', from: '2026-10-16', to: '2026-10-20' },
        { laneId: 'operacoes', from: '2026-10-27', to: '2026-10-31' },
      ],
    },
    {
      id: 'op-horizonte',
      name: 'Clínica Horizonte',
      slot: 2,
      stages: [
        { laneId: 'marketing', from: '2026-10-09', to: '2026-10-13' },
        { laneId: 'pre-vendas', from: '2026-10-16', to: '2026-10-21' },
        { laneId: 'executivo', from: '2026-10-26', to: '2026-10-30' },
      ],
    },
    {
      id: 'op-oeste',
      name: 'Indústria Oeste',
      slot: 4,
      stages: [
        { laneId: 'marketing', from: '2026-10-12', to: '2026-10-14' },
        { laneId: 'pre-vendas', from: '2026-10-15', to: '2026-10-19' },
      ],
    },
  ],
};
