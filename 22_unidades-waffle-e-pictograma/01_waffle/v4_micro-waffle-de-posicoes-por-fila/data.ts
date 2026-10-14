/**
 * Posições de SDR (pré-vendas) por fila: quantas das 6 estão ocupadas e quanto da fila converte em
 * venda. Dado fictício e fixo: nenhuma fila é de operação real.
 *
 * Os casos difíceis: uma fila sem dado de ocupação (`occupied` nulo, que não é fila vazia), uma fila
 * cheia (6 de 6) e uma conversão de 0,6% (1 venda em 160 leads), que não pinta nem um quadrado da grade de 100.
 */
export interface QueueRow {
  readonly id: string;
  readonly label: string;
  /** Posições ocupadas de `positions`, ou `null` quando a ocupação não foi coletada. */
  readonly occupied: number | null;
  /** Leads que entraram na fila no período, ou `null` quando não há base. */
  readonly leads: number | null;
  /** Leads da fila que viraram venda, ou `null` quando não há base. */
  readonly sales: number | null;
}

export interface QueueData {
  /** Posições previstas em cada fila. */
  readonly positions: number;
  readonly rows: readonly QueueRow[];
}

export const data: QueueData = {
  positions: 6,
  rows: [
    { id: 'inbound-sul', label: 'Inbound Sul', occupied: 4, leads: 282, sales: 40 },
    { id: 'inbound-norte', label: 'Inbound Norte', occupied: 6, leads: 520, sales: 51 },
    { id: 'reativacao', label: 'Reativação de base', occupied: null, leads: 410, sales: 25 },
    { id: 'indicacoes', label: 'Indicações', occupied: 2, leads: 160, sales: 1 },
  ],
};
