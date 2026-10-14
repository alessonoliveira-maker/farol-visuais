/**
 * Temperatura dos mesmos 1.240 leads em três meses seguidos (jun a ago de 2026), com uma categoria
 * que nasce no meio da série: Morno só passou a existir em julho. Dado fictício e fixo: cada linha
 * de `data` é o volume de leads que estava numa temperatura no mês de origem e foi para outra (ou a
 * mesma) no mês seguinte, e a soma de toda coluna é sempre 1.240.
 *
 * POR QUE A EXISTÊNCIA DA CATEGORIA É DECLARADA, e não deduzida do total. Em junho o total de Morno
 * é zero, e zero tem dois significados diferentes que o desenho não pode confundir: "ninguém estava
 * Morno" e "Morno não existia". O primeiro é zero medido e a EST-3 manda desenhar a marca e escrever
 * o número; o segundo é ausência, e a DAD-2 proíbe exibi-la como zero. Deduzir presença de
 * `total > 0` transformaria todo zero medido em categoria inexistente, calado. Por isso cada
 * categoria declara em qual coluna ela passa a existir e em qual deixa de existir.
 */
export interface AlluvialCategory {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa na paleta categórica (COR-8: ordem 1, 3, 6, 5), ou `null` na categoria de ausência,
   * que é neutra e vai por último.
   */
  readonly slot: 1 | 3 | 5 | 6 | null;
  /** Índice da primeira coluna em que a categoria existe. Morno nasce na segunda coluna. */
  readonly firstColumn: number;
  /** Índice da última coluna em que a categoria existe. A ausência morre na primeira. */
  readonly lastColumn: number;
  /** A categoria de ausência: bloco vazado, contorno neutro, sempre a última da pilha. */
  readonly absence: boolean;
}

export interface AlluvialColumn {
  readonly id: string;
  /** Mês em YYYY-MM, usado por `formatMonthShort`. */
  readonly month: string;
}

export interface AlluvialFlow {
  /** Índice do par de colunas: 0 liga a coluna 0 à 1, 1 liga a coluna 1 à 2. */
  readonly fromColumn: number;
  readonly fromCategory: string;
  readonly toCategory: string;
  readonly count: number;
}

/** Ordem fixa nas três colunas, com a ausência por último (COR-4 e o item 4 da Anatomia do modelo). */
export const categories: readonly AlluvialCategory[] = [
  { id: 'quente', label: 'Quente', slot: 1, firstColumn: 0, lastColumn: 2, absence: false },
  { id: 'morno', label: 'Morno', slot: 3, firstColumn: 1, lastColumn: 2, absence: false },
  { id: 'frio', label: 'Frio', slot: 6, firstColumn: 0, lastColumn: 2, absence: false },
  { id: 'descartado', label: 'Descartado', slot: 5, firstColumn: 0, lastColumn: 2, absence: false },
  { id: 'sem-classificacao', label: 'Sem classificação', slot: null, firstColumn: 0, lastColumn: 0, absence: true },
];

export const columns: readonly AlluvialColumn[] = [
  { id: 'jun', month: '2026-06' },
  { id: 'jul', month: '2026-07' },
  { id: 'ago', month: '2026-08' },
];

export const data: readonly AlluvialFlow[] = [
  // jun para jul. As quatro últimas linhas do par são os 388 leads que não tinham classificação.
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'quente', count: 120 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'morno', count: 40 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'frio', count: 15 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'descartado', count: 5 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'quente', count: 20 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'morno', count: 60 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'frio', count: 300 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'descartado', count: 40 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'quente', count: 5 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'morno', count: 12 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'frio', count: 15 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'descartado', count: 220 },
  { fromColumn: 0, fromCategory: 'sem-classificacao', toCategory: 'quente', count: 35 },
  { fromColumn: 0, fromCategory: 'sem-classificacao', toCategory: 'morno', count: 205 },
  { fromColumn: 0, fromCategory: 'sem-classificacao', toCategory: 'frio', count: 118 },
  { fromColumn: 0, fromCategory: 'sem-classificacao', toCategory: 'descartado', count: 30 },
  // jul para ago. Ninguém volta para a ausência: a categoria deixou de existir.
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'quente', count: 110 },
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'morno', count: 45 },
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'frio', count: 15 },
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'descartado', count: 10 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'quente', count: 40 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'morno', count: 200 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'frio', count: 55 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'descartado', count: 22 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'quente', count: 15 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'morno', count: 60 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'frio', count: 320 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'descartado', count: 53 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'quente', count: 5 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'morno', count: 20 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'frio', count: 35 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'descartado', count: 235 },
];
