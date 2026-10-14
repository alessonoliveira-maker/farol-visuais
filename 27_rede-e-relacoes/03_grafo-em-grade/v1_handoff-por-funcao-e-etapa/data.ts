/**
 * Passagens de oportunidade entre funções comerciais no 3º trimestre de 2026, em contagem de
 * oportunidades por par de nós. Cada nó é uma função numa etapa do funil; a aresta diz de quem
 * passa para quem. Dado fictício e fixo: as funções são papéis do time, nenhuma é pessoa real.
 * Célula sem nó é função sem papel naquela etapa. As arestas descem uma etapa por vez ou correm
 * na mesma etapa, e a ordem do array não importa: o componente calcula posição e pontas.
 */
export interface GridAxis {
  readonly id: string;
  /** Nome do eixo como aparece no cabeçalho da coluna ou no rótulo da linha. */
  readonly label: string;
}

export interface GridNode {
  readonly id: string;
  readonly column: string;
  readonly row: string;
  /** O que a função faz nessa etapa, em até 20 caracteres para caber no nó. */
  readonly label: string;
}

export interface GridEdge {
  readonly from: string;
  readonly to: string;
  /** Oportunidades que passaram de um nó ao outro no período. Inteiro maior que zero. */
  readonly count: number;
}

export interface HandoffGrid {
  readonly period: string;
  readonly columns: readonly GridAxis[];
  readonly rows: readonly GridAxis[];
  readonly nodes: readonly GridNode[];
  readonly edges: readonly GridEdge[];
}

export const data: HandoffGrid = {
  period: '3º trimestre de 2026',
  columns: [
    { id: 'marketing', label: 'Marketing' },
    { id: 'pre-vendas', label: 'Pré-vendas' },
    { id: 'executivo', label: 'Executivo' },
    { id: 'relacionamento', label: 'Relacionamento' },
  ],
  rows: [
    { id: 'entrada', label: 'Entrada' },
    { id: 'qualificacao', label: 'Qualificação' },
    { id: 'proposta', label: 'Proposta' },
    { id: 'pos-venda', label: 'Pós-venda' },
  ],
  nodes: [
    { id: 'mkt-entrada', column: 'marketing', row: 'entrada', label: 'Capta o contato' },
    { id: 'pv-indicacao', column: 'pre-vendas', row: 'entrada', label: 'Recebe indicação' },
    { id: 'pv-qualifica', column: 'pre-vendas', row: 'qualificacao', label: 'Qualifica e agenda' },
    { id: 'exe-proposta', column: 'executivo', row: 'proposta', label: 'Conduz a proposta' },
    { id: 'exe-contrato', column: 'executivo', row: 'pos-venda', label: 'Fecha o contrato' },
    { id: 'rel-implanta', column: 'relacionamento', row: 'pos-venda', label: 'Acompanha o cliente' },
  ],
  edges: [
    { from: 'mkt-entrada', to: 'pv-qualifica', count: 1420 },
    { from: 'pv-indicacao', to: 'pv-qualifica', count: 310 },
    { from: 'pv-qualifica', to: 'exe-proposta', count: 860 },
    { from: 'exe-proposta', to: 'exe-contrato', count: 412 },
    { from: 'exe-contrato', to: 'rel-implanta', count: 388 },
  ],
};
