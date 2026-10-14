/**
 * Custo de 2026 em três camadas (R$) por centro de custo, agrupado por área, com subtotal por
 * área e total geral. Dado fictício e fixo. Subtotal e total geral são SOMA: cada subtotal de área
 * soma exatamente as linhas do grupo, e o total geral soma exatamente os três subtotais, em cada
 * camada e na coluna de total.
 */
export interface CostCenter {
  readonly id: string;
  readonly name: string;
  readonly camada1: number;
  readonly camada2: number;
  readonly camada3: number;
}

export interface CostArea {
  readonly id: string;
  readonly name: string;
  readonly centers: readonly CostCenter[];
}

export const data: readonly CostArea[] = [
  {
    id: 'area-marketing',
    name: 'Marketing',
    // Subtotal (soma): camada1 57.800; camada2 22.600; camada3 9.100.
    centers: [
      { id: 'midia-paga', name: 'Mídia paga', camada1: 42_000, camada2: 18_500, camada3: 6_200 },
      { id: 'conteudo', name: 'Conteúdo', camada1: 15_800, camada2: 4_100, camada3: 2_900 },
    ],
  },
  {
    id: 'area-comercial',
    name: 'Comercial',
    // Subtotal (soma): camada1 109.100; camada2 37.300; camada3 14.000.
    centers: [
      { id: 'sdr', name: 'SDR', camada1: 28_400, camada2: 9_600, camada3: 3_100 },
      { id: 'vendas', name: 'Vendas', camada1: 61_200, camada2: 22_300, camada3: 8_700 },
      { id: 'pos-venda', name: 'Pós-venda', camada1: 19_500, camada2: 5_400, camada3: 2_200 },
    ],
  },
  {
    id: 'area-produto',
    name: 'Produto',
    // Subtotal (soma): camada1 108.600; camada2 38.000; camada3 14.400.
    centers: [
      { id: 'dados', name: 'Dados', camada1: 33_700, camada2: 11_200, camada3: 4_800 },
      { id: 'engenharia', name: 'Engenharia', camada1: 74_900, camada2: 26_800, camada3: 9_600 },
    ],
  },
];
