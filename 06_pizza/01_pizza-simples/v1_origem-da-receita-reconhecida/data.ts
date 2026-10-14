/**
 * Receita reconhecida no 3º trimestre por origem, em reais.
 * Dado fictício e fixo: nenhuma origem corresponde a cliente ou produto real.
 */
export interface RevenueOrigin {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  /** Slot categórico fixo (COR-8): a cor segue a categoria, não a posição depois de ordenar por valor. */
  readonly slot: number;
}

export const data: readonly RevenueOrigin[] = [
  { id: 'cliente-novo', name: 'Cliente novo', value: 1_091_200, slot: 0 },
  { id: 'expansao', name: 'Expansão de cliente ativo', value: 917_600, slot: 1 },
  { id: 'renovacao', name: 'Renovação', value: 372_000, slot: 2 },
  { id: 'ajustes', name: 'Ajustes e outras entradas', value: 99_200, slot: 3 },
];
