/**
 * Passagens entre funções comerciais em 2026-08, com quantas estouraram o prazo acordado (SLA).
 * Cada aresta traz o total de passagens e as que passaram do prazo; `late` zero é zero medido, e
 * ausência de medição não entra aqui. Dado fictício e fixo: as funções são papéis do time. As
 * arestas ligam etapas diferentes, de cima para baixo, e a ordem do array não importa.
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

export interface SlaEdge {
  readonly from: string;
  readonly to: string;
  /** Passagens do nó de origem ao de destino no mês. Inteiro maior que zero. */
  readonly count: number;
  /** Quantas dessas passagens passaram do prazo acordado. Zero é zero medido. */
  readonly late: number;
}

export interface SlaGrid {
  /** Mês do recorte em `YYYY-MM`. */
  readonly period: string;
  /** Parcela de passagens fora do prazo, em fração, a partir da qual a seta vira alerta. */
  readonly alertShare: number;
  readonly columns: readonly GridAxis[];
  readonly rows: readonly GridAxis[];
  readonly nodes: readonly GridNode[];
  readonly edges: readonly SlaEdge[];
}

export const data: SlaGrid = {
  period: '2026-08',
  alertShare: 0.15,
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
    { from: 'mkt-entrada', to: 'pv-qualifica', count: 1420, late: 128 },
    { from: 'pv-indicacao', to: 'pv-qualifica', count: 310, late: 0 },
    { from: 'pv-qualifica', to: 'exe-proposta', count: 860, late: 327 },
    { from: 'exe-proposta', to: 'exe-contrato', count: 412, late: 41 },
    { from: 'exe-proposta', to: 'rel-implanta', count: 388, late: 74 },
  ],
};
