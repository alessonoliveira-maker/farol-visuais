/**
 * Agendas de pré-vendas do mês de 2026-08, por resultado, em unidades.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface AgendaResultado {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export const data: readonly AgendaResultado[] = [
  { id: 'realizada', name: 'Realizada', value: 81 },
  { id: 'remarcada', name: 'Remarcada', value: 33 },
  { id: 'nao-compareceu', name: 'Não compareceu', value: 18 },
];
