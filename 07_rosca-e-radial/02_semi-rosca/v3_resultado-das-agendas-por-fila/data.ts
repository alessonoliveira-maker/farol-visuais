/**
 * Agendas de pré-vendas da semana de 2026-09-07 a 2026-09-11, por fila e por resultado, em
 * unidades. Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 */
export interface ResultadoAgenda {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

export interface FilaAgendas {
  readonly id: string;
  readonly name: string;
  readonly resultados: readonly ResultadoAgenda[];
}

export const data: readonly FilaAgendas[] = [
  {
    id: 'inbound',
    name: 'Inbound',
    resultados: [
      { id: 'realizada', name: 'Realizada', value: 39 },
      { id: 'remarcada', name: 'Remarcada', value: 12 },
      { id: 'nao-compareceu', name: 'Não compareceu', value: 7 },
    ],
  },
  {
    id: 'outbound',
    name: 'Outbound',
    resultados: [
      { id: 'realizada', name: 'Realizada', value: 44 },
      { id: 'remarcada', name: 'Remarcada', value: 21 },
      { id: 'nao-compareceu', name: 'Não compareceu', value: 14 },
    ],
  },
  {
    id: 'reativacao',
    name: 'Reativação',
    resultados: [
      { id: 'realizada', name: 'Realizada', value: 6 },
      { id: 'remarcada', name: 'Remarcada', value: 3 },
      { id: 'nao-compareceu', name: 'Não compareceu', value: 2 },
    ],
  },
];

/** Cor fixa por resultado, na mesma ordem das três filas (slots 1, 3, 6 da COR-8). */
export const resultadoOrder: readonly string[] = ['realizada', 'remarcada', 'nao-compareceu'];
