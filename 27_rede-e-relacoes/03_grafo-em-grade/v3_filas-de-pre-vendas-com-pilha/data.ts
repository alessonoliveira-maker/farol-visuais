/**
 * Redistribuição de leads entre filas de trabalho da pré-vendas num mês fictício, em contagem de
 * leads por passagem. As colunas são as origens do lead e as linhas, as etapas de qualificação; cada
 * nó é uma fila numa célula. Célula com mais de um nó vira pilha, e as arestas dela saem da célula.
 * Aresta que aponta para uma etapa anterior é retorno. Dado fictício e fixo: nenhuma fila é pessoa
 * real. Os nós da direita de cada linha deixam o corredor de retorno livre.
 */
export interface GridAxis {
  readonly id: string;
  /** Nome do eixo como aparece no cabeçalho da coluna ou no rótulo da linha. */
  readonly label: string;
}

export interface QueueNode {
  readonly id: string;
  readonly column: string;
  readonly row: string;
  /** Nome da fila, em até 12 caracteres para caber no nó. */
  readonly label: string;
}

export interface Redistribution {
  readonly from: string;
  readonly to: string;
  /** Leads que saíram de uma fila e entraram na outra no período. Inteiro maior que zero. */
  readonly count: number;
}

export interface QueueGrid {
  readonly period: string;
  readonly columns: readonly GridAxis[];
  readonly rows: readonly GridAxis[];
  readonly nodes: readonly QueueNode[];
  readonly edges: readonly Redistribution[];
}

export const data: QueueGrid = {
  period: '2026-08',
  columns: [
    { id: 'inbound', label: 'Inbound' },
    { id: 'outbound', label: 'Outbound' },
    { id: 'indicacao', label: 'Indicação' },
    { id: 'reativacao', label: 'Reativação' },
  ],
  rows: [
    { id: 'triagem', label: 'Triagem' },
    { id: 'contato', label: 'Contato' },
    { id: 'qualificacao', label: 'Qualificação' },
    { id: 'reuniao', label: 'Reunião' },
    { id: 'entrega', label: 'Entrega' },
  ],
  nodes: [
    { id: 'n-novos', column: 'inbound', row: 'triagem', label: 'Novos leads' },
    { id: 'n-lista', column: 'outbound', row: 'triagem', label: 'Lista fria' },
    { id: 'n-indicados', column: 'indicacao', row: 'triagem', label: 'Indicados' },
    { id: 'n-base', column: 'reativacao', row: 'triagem', label: 'Base parada' },
    { id: 'c-resposta', column: 'inbound', row: 'contato', label: 'Resposta' },
    { id: 'c-cadencia-curta', column: 'outbound', row: 'contato', label: 'Cadência curta' },
    { id: 'c-cadencia-longa', column: 'outbound', row: 'contato', label: 'Cadência longa' },
    { id: 'c-ligacao', column: 'outbound', row: 'contato', label: 'Ligação direta' },
    { id: 'c-apresentacao', column: 'indicacao', row: 'contato', label: 'Apresentação' },
    { id: 'c-retomada', column: 'reativacao', row: 'contato', label: 'Retomada' },
    { id: 'q-pontuacao', column: 'inbound', row: 'qualificacao', label: 'Pontuação' },
    { id: 'q-triagem-fina', column: 'indicacao', row: 'qualificacao', label: 'Triagem fina' },
    { id: 'r-geral', column: 'inbound', row: 'reuniao', label: 'Agenda geral' },
    { id: 'r-alta', column: 'indicacao', row: 'reuniao', label: 'Agenda alta' },
    { id: 'e-executivo', column: 'indicacao', row: 'entrega', label: 'Executivo' },
  ],
  edges: [
    { from: 'n-novos', to: 'c-resposta', count: 520 },
    { from: 'n-lista', to: 'c-cadencia-longa', count: 340 },
    { from: 'n-indicados', to: 'c-apresentacao', count: 180 },
    { from: 'n-base', to: 'c-retomada', count: 90 },
    { from: 'c-resposta', to: 'q-pontuacao', count: 410 },
    { from: 'c-cadencia-curta', to: 'q-pontuacao', count: 120 },
    { from: 'c-cadencia-longa', to: 'q-triagem-fina', count: 150 },
    { from: 'c-apresentacao', to: 'q-triagem-fina', count: 160 },
    { from: 'q-pontuacao', to: 'r-geral', count: 300 },
    { from: 'q-triagem-fina', to: 'r-alta', count: 200 },
    { from: 'q-triagem-fina', to: 'c-retomada', count: 28 },
    { from: 'r-alta', to: 'e-executivo', count: 260 },
    { from: 'r-geral', to: 'e-executivo', count: 150 },
  ],
};

/** Nó cujo caminho acende por padrão: a fila de onde a cadência longa sai e para onde segue. */
export const highlightId = 'c-cadencia-longa';
