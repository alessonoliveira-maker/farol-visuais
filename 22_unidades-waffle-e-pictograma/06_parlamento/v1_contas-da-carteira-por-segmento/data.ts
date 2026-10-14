/**
 * Contas da carteira de um executivo por segmento atendido, em unidades, no corte de 2026-09-30.
 * Dado fictício e fixo: nenhum segmento, pessoa ou empresa é real.
 * O dado exercita nome longo, empate (dois segmentos com 18 contas) e a categoria de ausência,
 * "Sem segmento declarado", que é de primeira classe: fica visível, em ponto vazado, e por último.
 */
export interface SegmentGroup {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /**
   * Posição fixa do segmento na paleta (1 a 6, que viram `--chart-1` a `--chart-6`).
   * A cor pertence ao segmento e não à posição no arco: trocar a carteira não troca a cor.
   * O dicionário distribui na ordem 1, 3, 6, 5, 2, 4 (CONTRATO, COR-8).
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Contas sem segmento no cadastro (ausência de dado): recebem o ponto vazado em tom neutro. */
  readonly neutral?: boolean;
}

export const data: readonly SegmentGroup[] = [
  { id: 'varejo-alimentar', label: 'Varejo alimentar', count: 48, slot: 1 },
  { id: 'industria-de-embalagens', label: 'Indústria de embalagens', count: 30, slot: 3 },
  { id: 'atacado-e-distribuicao', label: 'Atacado e distribuição', count: 18, slot: 6 },
  { id: 'clinicas-e-laboratorios', label: 'Clínicas e laboratórios', count: 18, slot: 5 },
  { id: 'sem-segmento', label: 'Sem segmento declarado', count: 6, neutral: true },
];

/** O que o total conta, impresso sob o número do centro da base. */
export const totalCaption = 'contas na carteira';
