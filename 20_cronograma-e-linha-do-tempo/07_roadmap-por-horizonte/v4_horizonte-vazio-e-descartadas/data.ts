/**
 * Roadmap de Marketing com a coluna depois ainda vazia e uma quarta coluna de iniciativas
 * descartadas no ciclo de 2026-09, cada uma com o motivo curto. Uma iniciativa não declara
 * público (`audience: null`) e um título é longo de propósito. Dado fictício e fixo.
 */
export type ColumnId = 'agora' | 'proximo' | 'depois' | 'descartado';
export type Audience = 'Comercial' | 'Pré-vendas' | 'Marketing' | 'Diretoria';

export interface RoadmapColumn {
  readonly id: ColumnId;
  readonly label: string;
}

export interface DiscardableInitiative {
  readonly id: string;
  readonly title: string;
  readonly audience: Audience | null;
  readonly column: ColumnId;
  readonly priority: number;
  /** Só nas descartadas: o motivo em poucas palavras. */
  readonly reason: string | null;
}

export interface DiscardRoadmap {
  /** Ciclo em que as descartadas saíram, `YYYY-MM`. */
  readonly cycle: string;
  readonly columns: readonly RoadmapColumn[];
  readonly initiatives: readonly DiscardableInitiative[];
}

export const data: DiscardRoadmap = {
  cycle: '2026-09',
  columns: [
    { id: 'agora', label: 'Agora' },
    { id: 'proximo', label: 'Próximo' },
    { id: 'depois', label: 'Depois' },
    { id: 'descartado', label: 'Descartado' },
  ],
  initiatives: [
    { id: 'mk-08', title: 'Painel de brindes', audience: 'Marketing', column: 'descartado', priority: 3, reason: 'custo maior que o ganho' },
    { id: 'mk-02', title: 'Conversão por canal de origem e por campanha ativa no trimestre corrente', audience: 'Marketing', column: 'agora', priority: 2, reason: null },
    { id: 'mk-05', title: 'Revisão do glossário de métricas', audience: null, column: 'proximo', priority: 3, reason: null },
    { id: 'mk-01', title: 'Custo por lead qualificado', audience: 'Marketing', column: 'agora', priority: 1, reason: null },
    { id: 'mk-06', title: 'Nuvem de palavras de campanhas', audience: 'Marketing', column: 'descartado', priority: 1, reason: 'sem uso na decisão' },
    { id: 'mk-04', title: 'Calendário editorial', audience: 'Marketing', column: 'proximo', priority: 1, reason: null },
    { id: 'mk-03', title: 'Metas de leads por time', audience: 'Comercial', column: 'agora', priority: 3, reason: null },
    { id: 'mk-07', title: 'Ranking de leads por cidade', audience: 'Comercial', column: 'descartado', priority: 2, reason: 'dado de cidade incompleto' },
    { id: 'mk-09', title: 'Pesquisa de satisfação', audience: 'Pré-vendas', column: 'proximo', priority: 2, reason: null },
  ],
};
