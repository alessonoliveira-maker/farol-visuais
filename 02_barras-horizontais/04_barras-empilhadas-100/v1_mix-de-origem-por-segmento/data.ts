/**
 * Leads que entraram no trimestre, contados por segmento de conta e canal de origem.
 * Contagem de leads. Dado fictício e fixo: nenhum número vem de base real.
 * Os segmentos seguem a ordem natural de porte; Grandes contas tem poucos leads de propósito,
 * para o n escrito à direita mostrar que a barra dela pesa menos que a das pequenas.
 */
export type OriginId = 'indicacao' | 'busca-paga' | 'evento' | 'redes-sociais' | 'sem-origem';

export interface OriginComponent {
  readonly id: OriginId;
  readonly label: string;
  /**
   * Posição fixa na paleta (1 a 6, que viram `--chart-1` a `--chart-6`), atribuída na ordem
   * 1, 3, 6, 5 (CONTRATO, COR-8). A cor é da origem, não da posição na pilha.
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Ausência de dado: segmento vazado em neutro, sempre por último. */
  readonly neutral?: boolean;
}

export interface SegmentMix {
  readonly id: string;
  readonly label: string;
  /** Leads por origem. Toda origem de `components` aparece, mesmo com zero. */
  readonly counts: Readonly<Record<OriginId, number>>;
}

/** A ordem desta lista é a ordem da pilha, da base (esquerda) para a ponta, e a ordem da legenda. */
export const components: readonly OriginComponent[] = [
  { id: 'indicacao', label: 'Indicação', slot: 1 },
  { id: 'busca-paga', label: 'Busca paga', slot: 3 },
  { id: 'evento', label: 'Evento', slot: 6 },
  { id: 'redes-sociais', label: 'Redes sociais', slot: 5 },
  { id: 'sem-origem', label: 'Sem origem declarada', neutral: true },
];

export const data: readonly SegmentMix[] = [
  {
    id: 'pequenas',
    label: 'Pequenas contas',
    counts: { indicacao: 74, 'busca-paga': 168, evento: 29, 'redes-sociais': 103, 'sem-origem': 38 },
  },
  {
    id: 'medias',
    label: 'Médias contas',
    counts: { indicacao: 58, 'busca-paga': 61, evento: 27, 'redes-sociais': 22, 'sem-origem': 19 },
  },
  {
    id: 'grandes',
    label: 'Grandes contas',
    counts: { indicacao: 18, 'busca-paga': 6, evento: 9, 'redes-sociais': 2, 'sem-origem': 3 },
  },
];
