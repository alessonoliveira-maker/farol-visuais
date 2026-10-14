/**
 * Três filas de trabalho da pré-vendas no dia, na mesma escala de capacidade diária.
 * `value` nulo é fila sem coleta no dia (nunca zero). Dado fictício e fixo: nenhuma
 * pessoa ou empresa é real.
 */
export interface QueueArcStatus {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly capacity: number;
}

export const data: readonly QueueArcStatus[] = [
  { id: 'novos', label: 'Leads novos', value: 18, capacity: 25 },
  { id: 'reativacao', label: 'Reativação de base', value: 0, capacity: 25 },
  { id: 'handoff', label: 'Handoff SDR e Vendas', value: null, capacity: 25 },
];

/** De onde vem o teto comum às três filas: sem isso a escala compartilhada parece arbitrária. */
export const capacitySource = 'teto diário combinado com o time de pré-vendas para as três filas';
