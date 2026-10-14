/**
 * Passagens de oportunidade entre funções comerciais no 3º trimestre de 2026, com a etapa em que
 * nenhuma função está definida como responsável. Cada nó é uma função numa etapa; cada `gaps` é uma
 * célula esperada que ninguém assumiu e que recebe passagem. Célula sem nó e fora de `gaps` é função
 * que não atua na etapa, o que é outra coisa. Dado fictício e fixo: as funções são papéis do time.
 */
export interface GridAxis {
  readonly id: string;
  /** Nome do eixo como aparece no cabeçalho da coluna ou no rótulo da linha. */
  readonly label: string;
}

export interface OwnedNode {
  readonly id: string;
  readonly column: string;
  readonly row: string;
  /** O que a função faz nessa etapa, em até 15 caracteres para caber no nó. */
  readonly label: string;
}

/** Célula esperada sem responsável: o processo chega nela e ninguém é dono dali em diante. */
export interface UnownedCell {
  readonly id: string;
  readonly column: string;
  readonly row: string;
}

export interface Passage {
  readonly from: string;
  /** Id de um nó ou de uma célula sem dono. */
  readonly to: string;
  /** Oportunidades que passaram no período. Inteiro maior que zero. */
  readonly count: number;
}

export interface OwnershipGrid {
  readonly period: string;
  readonly columns: readonly GridAxis[];
  readonly rows: readonly GridAxis[];
  readonly nodes: readonly OwnedNode[];
  readonly gaps: readonly UnownedCell[];
  readonly edges: readonly Passage[];
}

export const data: OwnershipGrid = {
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
    { id: 'mkt-entrada', column: 'marketing', row: 'entrada', label: 'Capta contato' },
    { id: 'pv-qualifica', column: 'pre-vendas', row: 'qualificacao', label: 'Qualifica' },
    { id: 'exe-proposta', column: 'executivo', row: 'proposta', label: 'Conduz proposta' },
  ],
  gaps: [{ id: 'sem-dono-pos-venda', column: 'relacionamento', row: 'pos-venda' }],
  edges: [
    { from: 'mkt-entrada', to: 'pv-qualifica', count: 1420 },
    { from: 'pv-qualifica', to: 'exe-proposta', count: 860 },
    { from: 'exe-proposta', to: 'sem-dono-pos-venda', count: 388 },
  ],
};
