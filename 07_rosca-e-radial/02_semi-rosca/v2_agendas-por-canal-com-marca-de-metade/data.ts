/**
 * Agendas de pré-vendas da semana de 2026-09-07 a 2026-09-11, por canal de origem, em unidades.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface AgendaCanal {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export const data: readonly AgendaCanal[] = [
  { id: 'inbound', name: 'Inbound', value: 69 },
  { id: 'outbound', name: 'Outbound', value: 79 },
];
