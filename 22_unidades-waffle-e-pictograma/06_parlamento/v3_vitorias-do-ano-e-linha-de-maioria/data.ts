/**
 * Vitórias comerciais do ano de 2026 por origem da oportunidade, em unidades, até 2026-09-30.
 * Dado fictício e fixo: nenhuma origem, pessoa ou empresa é real.
 * O dado exercita o valor pequeno (uma origem com 2 vitórias) e a categoria de ausência,
 * "Sem origem declarada", que fica visível, em ponto vazado, e por último no arco.
 */
export interface OriginWins {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /**
   * Posição fixa da origem na paleta do painel (1 a 6), a mesma em todo gráfico da página.
   * A cor pertence à origem e não à posição no arco; o dicionário segue a ordem 1, 3, 6, 5, 2, 4
   * (CONTRATO, COR-8).
   */
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Vitórias sem origem no cadastro (ausência de dado): recebem o ponto vazado em tom neutro. */
  readonly neutral?: boolean;
}

export const data: readonly OriginWins[] = [
  { id: 'indicacao', label: 'Indicação', count: 23, slot: 1 },
  { id: 'cliente-ativo', label: 'Cliente ativo', count: 18, slot: 3 },
  { id: 'prospeccao-ativa', label: 'Prospecção ativa', count: 17, slot: 6 },
  { id: 'eventos-do-setor', label: 'Eventos do setor', count: 9, slot: 5 },
  { id: 'formulario-do-site', label: 'Formulário do site', count: 2, slot: 2 },
  { id: 'sem-origem', label: 'Sem origem declarada', count: 5, neutral: true },
];

/**
 * Origens cuja soma a anotação confronta com a metade. Elas entram primeiro no arco, nesta ordem,
 * para a soma partir da ponta esquerda e cruzar (ou não) a linha do meio.
 */
export const coalitionIds: readonly string[] = ['indicacao', 'cliente-ativo'];

/** O que o total conta, impresso sob o número do centro da base. */
export const totalCaption = 'vitórias no ano';
