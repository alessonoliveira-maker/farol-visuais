/**
 * Estrutura fictícia da área comercial: um único nó raiz que se divide em três grupos
 * (Comercial, Pré-vendas e Marketing) e, dentro de cada grupo, em funções com a quantidade
 * de pessoas por função. Dado fictício e fixo: nenhuma pessoa é citada, só cargo e contagem.
 * O headcount de todo nó que não é folha nasce da soma dos filhos, calculada no Chart;
 * nenhum total de grupo ou de raiz é digitado aqui.
 */
export interface OrgNode {
  readonly id: string;
  readonly label: string;
  /** Só as folhas (funções) declaram headcount; grupo e raiz somam os filhos no Chart. */
  readonly headcount?: number;
  /**
   * Só os grupos (filhos diretos da raiz) declaram slot: mapa fixo de categoria para cor,
   * na ordem da COR-8 (1, 3, 6, 5, 2, 4). O Chart nunca infere cor pela posição no array
   * (COR-3); função e raiz herdam o slot do grupo em que vivem.
   */
  readonly slot?: number;
  readonly children?: readonly OrgNode[];
}

export const data: readonly OrgNode[] = [
  {
    id: 'area-comercial',
    label: 'Área Comercial',
    children: [
      {
        id: 'comercial',
        label: 'Comercial',
        slot: 1,
        children: [
          { id: 'executivo-contas', label: 'Executivo de Contas', headcount: 4 },
          { id: 'coordenador-comercial', label: 'Coordenador Comercial', headcount: 1 },
        ],
      },
      {
        id: 'pre-vendas',
        label: 'Pré-vendas',
        slot: 3,
        children: [
          { id: 'sdr', label: 'SDR', headcount: 5 },
          { id: 'coordenador-pre-vendas', label: 'Coordenador de Pré-vendas', headcount: 1 },
        ],
      },
      {
        id: 'marketing',
        label: 'Marketing',
        slot: 6,
        children: [
          { id: 'analista-performance', label: 'Analista de Performance de Mídia', headcount: 2 },
          { id: 'analista-conteudo', label: 'Analista de Conteúdo', headcount: 1 },
          { id: 'coordenador-marketing', label: 'Coordenador de Marketing', headcount: 1 },
        ],
      },
    ],
  },
];
