/**
 * Custo da área em 2026-08, em reais: pessoas 160 mil e comissão 22 mil entram inteiras; mídia de
 * 118 mil se divide em quatro plataformas e ferramentas de 26 mil em dois contratos. Total de 326 mil.
 * Dado fictício e fixo: nomes de plataforma e de contrato são genéricos, sem marca real.
 * Todo passo soma (custo só entra), então nenhum mistura sinais. Os valores de `parts` são do passo.
 * Fechamento: 160.000 + 118.000 + 26.000 + 22.000 = 326.000.
 */
export interface Part {
  readonly id: string;
  readonly label: string;
  /** Slot categórico fixo (COR-3). Plataformas em 1, 3, 6, 5 e contratos em 2 e 4: seis cores no total (COR-4). */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PartValue {
  readonly partId: string;
  readonly value: number;
}

export type CostStep =
  | { readonly id: string; readonly label: string; readonly kind: 'total'; readonly value: number }
  | { readonly id: string; readonly label: string; readonly kind: 'whole'; readonly value: number }
  | { readonly id: string; readonly label: string; readonly kind: 'segmented'; readonly parts: readonly PartValue[] };

/** Base ao topo da pilha dentro de cada passo segmentado. */
export const parts: readonly Part[] = [
  { id: 'rede-social', label: 'Rede social', slot: 1 },
  { id: 'busca-paga', label: 'Busca paga', slot: 3 },
  { id: 'rede-profissional', label: 'Rede profissional', slot: 6 },
  { id: 'video', label: 'Vídeo', slot: 5 },
  { id: 'contrato-analise', label: 'Contrato de análise', slot: 2 },
  { id: 'contrato-envio', label: 'Contrato de envio', slot: 4 },
];

export const period = '2026-08';

export const data: readonly CostStep[] = [
  { id: 'pessoas', label: 'Pessoas', kind: 'whole', value: 160_000 },
  {
    id: 'midia',
    label: 'Mídia',
    kind: 'segmented',
    parts: [
      { partId: 'rede-social', value: 38_000 },
      { partId: 'busca-paga', value: 41_000 },
      { partId: 'rede-profissional', value: 24_000 },
      { partId: 'video', value: 15_000 },
    ],
  },
  {
    id: 'ferramentas',
    label: 'Ferramentas',
    kind: 'segmented',
    parts: [
      { partId: 'contrato-analise', value: 16_000 },
      { partId: 'contrato-envio', value: 10_000 },
    ],
  },
  { id: 'comissao', label: 'Comissão', kind: 'whole', value: 22_000 },
  { id: 'total', label: 'Custo total', kind: 'total', value: 326_000 },
];
