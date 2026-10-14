/**
 * Demanda das filas de pré-vendas contra o teto de capacidade do mês. Dado fictício e fixo,
 * referente a agosto de 2026. `demand: null` é fila sem coleta no período: nunca vira zero.
 * `capBasis` diz se o teto é medido de fato ou premissa, ainda sem base de medição fechada.
 */
export interface QueueCapacity {
  readonly id: string;
  readonly label: string;
  readonly demand: number | null;
  readonly cap: number;
  readonly capBasis: 'medido' | 'premissa';
}

export interface QueueCapacityBoard {
  readonly period: string;
  readonly queues: readonly QueueCapacity[];
}

export const data: QueueCapacityBoard = {
  period: '2026-08',
  queues: [
    { id: 'fila-entradas', label: 'Entradas novas', demand: 214, cap: 180, capBasis: 'medido' },
    { id: 'fila-agendas', label: 'Agendas marcadas', demand: 132, cap: 150, capBasis: 'medido' },
    { id: 'fila-retomada', label: 'Retomada de contato', demand: 61, cap: 90, capBasis: 'premissa' },
    { id: 'fila-higienizacao', label: 'Higienização de base', demand: null, cap: 120, capBasis: 'medido' },
  ],
};
