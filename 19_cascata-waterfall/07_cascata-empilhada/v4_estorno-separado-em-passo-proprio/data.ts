/**
 * Mídia de 2026-08, em reais: R$ 124 mil investidos em quatro plataformas e R$ 6 mil de crédito
 * devolvido pela rede profissional, que vira passo próprio; a mídia líquida fecha em R$ 118 mil.
 * Dado fictício e fixo: nomes de plataforma genéricos, sem marca real.
 * Os valores de `parts` são magnitudes do passo e o sinal vem de `sign`: o estorno tem sinal oposto
 * ao investido, por isso não se empilha com ele. Fechamento: 124.000 − 6.000 = 118.000.
 */
export interface Part {
  readonly id: string;
  readonly label: string;
  /** Slot categórico fixo (COR-3), o mesmo no passo investido e no estornado. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PartValue {
  readonly partId: string;
  readonly value: number;
}

export type MediaStep =
  | { readonly id: string; readonly label: string; readonly kind: 'total'; readonly value: number }
  | { readonly id: string; readonly label: string; readonly kind: 'segmented'; readonly sign: 1 | -1; readonly parts: readonly PartValue[] };

/** Base ao topo da pilha, em todos os passos. */
export const parts: readonly Part[] = [
  { id: 'rede-social', label: 'Rede social', slot: 1 },
  { id: 'busca-paga', label: 'Busca paga', slot: 3 },
  { id: 'rede-profissional', label: 'Rede profissional', slot: 6 },
  { id: 'video', label: 'Vídeo', slot: 5 },
];

export const period = '2026-08';

export const data: readonly MediaStep[] = [
  {
    id: 'investida',
    label: 'Mídia investida',
    kind: 'segmented',
    sign: 1,
    parts: [
      { partId: 'rede-social', value: 38_000 },
      { partId: 'busca-paga', value: 41_000 },
      { partId: 'rede-profissional', value: 30_000 },
      { partId: 'video', value: 15_000 },
    ],
  },
  {
    id: 'estorno',
    label: 'Estorno',
    kind: 'segmented',
    sign: -1,
    parts: [{ partId: 'rede-profissional', value: 6_000 }],
  },
  { id: 'liquida', label: 'Mídia líquida', kind: 'total', value: 118_000 },
];
