/**
 * Oportunidades abertas no trimestre por canal de origem. Dado fictício e fixo.
 * "Sem origem declarada" é categoria de primeira classe: fica visível, em neutro vazado, e por último.
 */
export interface OriginSlice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /**
   * Posição fixa da categoria na paleta (1 a 6, que viram `--chart-1` a `--chart-6`).
   * A cor pertence à categoria e não à posição no ranking: trocar o período não troca a cor.
   * O dicionário distribui na ordem 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8).
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Categoria sem significado de canal (ausência de dado): recebe o neutro vazado. */
  readonly neutral?: boolean;
}

export const data: readonly OriginSlice[] = [
  { id: 'indicacao', label: 'Indicação', count: 58, slot: 1 },
  { id: 'busca-paga', label: 'Busca paga', count: 41, slot: 3 },
  { id: 'evento', label: 'Evento', count: 23, slot: 6 },
  { id: 'redes-sociais', label: 'Redes sociais', count: 17, slot: 5 },
  { id: 'sem-origem', label: 'Sem origem declarada', count: 14, neutral: true },
];

/** O que o total conta e o período, impresso depois do número. */
export const totalCaption = 'oportunidades no trimestre';
