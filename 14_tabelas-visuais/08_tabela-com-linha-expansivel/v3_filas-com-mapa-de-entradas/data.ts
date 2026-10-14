/**
 * Filas de pré-vendas: volume do mês, SLA de primeiro contato e capacidade contra o teto, com o
 * mapa de entradas por dia e faixa de horário de cada fila. Dado fictício e fixo.
 */
export interface Queue {
  readonly id: string;
  readonly name: string;
  readonly volumeMonth: number;
  readonly slaHours: number;
  readonly slaTargetHours: number;
  readonly capacityPct: number;
  /** Entradas por dia (linha) e faixa de horário (coluna): 5 dias x 5 faixas. */
  readonly entries: readonly (readonly number[])[];
}

export const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const;
export const HOUR_BINS = ['09h', '11h', '13h', '15h', '17h'] as const;

export const data: readonly Queue[] = [
  {
    id: 'fila-01',
    name: 'SDR Inbound São Paulo',
    volumeMonth: 412,
    slaHours: 3.2,
    slaTargetHours: 4,
    capacityPct: 0.82,
    entries: [
      [12, 18, 22, 15, 9],
      [14, 21, 26, 17, 11],
      [10, 19, 24, 16, 8],
      [13, 20, 27, 18, 10],
      [8, 14, 17, 12, 6],
    ],
  },
  {
    id: 'fila-02',
    name: 'SDR Inbound Santa Catarina',
    volumeMonth: 268,
    slaHours: 5.8,
    slaTargetHours: 4,
    capacityPct: 1.14,
    entries: [
      [9, 15, 19, 13, 7],
      [11, 17, 23, 15, 9],
      [8, 14, 18, 11, 6],
      [10, 16, 21, 14, 8],
      [6, 10, 13, 9, 4],
    ],
  },
  {
    id: 'fila-03',
    name: 'Outbound Concessionárias',
    volumeMonth: 190,
    slaHours: 2.1,
    slaTargetHours: 4,
    capacityPct: 0.55,
    entries: [
      [4, 7, 9, 6, 3],
      [5, 8, 11, 7, 4],
      [3, 6, 8, 5, 2],
      [5, 9, 12, 8, 4],
      [2, 4, 5, 3, 1],
    ],
  },
  {
    id: 'fila-04',
    name: 'Renovação de Carteira',
    volumeMonth: 96,
    slaHours: 6.4,
    slaTargetHours: 4,
    capacityPct: 0.97,
    entries: [
      [2, 4, 6, 3, 1],
      [3, 5, 7, 4, 2],
      [1, 3, 4, 2, 1],
      [2, 4, 5, 3, 1],
      [1, 2, 3, 1, 0],
    ],
  },
];

/** No preview, a fila de São Paulo já abre para mostrar o mapa de entradas. */
export const expandedIds: readonly string[] = ['fila-01'];
