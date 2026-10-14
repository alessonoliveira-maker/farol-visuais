/**
 * Temperatura dos mesmos 1.240 leads em três meses seguidos (jun a ago de 2026). Dado fictício
 * e fixo: cada linha de `data` é o volume de leads que estava numa temperatura no mês de origem
 * e foi para outra (ou a mesma) no mês seguinte. A soma das linhas com o mesmo `fromColumn` e a
 * mesma `fromCategory` bate com o total daquela categoria naquele mês, e a soma das linhas com o
 * mesmo `toCategory` bate com o total da categoria seguinte: a população nunca muda, só a
 * classificação dela.
 */
export interface AlluvialCategory {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa da categoria na paleta categórica (CONTRATO, COR-8): a mesma categoria tem a
   * mesma cor nas três colunas, na ordem de atribuição 1, 3, 6, 5 (2 e 4 ficam de fora porque
   * repetem o hex de `--warning` e `--positive`).
   */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
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

/** Ordem fixa nas três colunas: é ela que deixa o olho rastrear o bloco sem ler o rótulo de novo. */
export const categories: readonly AlluvialCategory[] = [
  { id: 'quente', label: 'Quente', slot: 1 },
  { id: 'morno', label: 'Morno', slot: 3 },
  { id: 'frio', label: 'Frio', slot: 6 },
  { id: 'descartado', label: 'Descartado', slot: 5 },
];

export const columns: readonly AlluvialColumn[] = [
  { id: 'jun', month: '2026-06' },
  { id: 'jul', month: '2026-07' },
  { id: 'ago', month: '2026-08' },
];

export const data: readonly AlluvialFlow[] = [
  // jun para jul (total de origem e de destino em cada categoria bate com os totais do mês).
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'quente', count: 150 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'morno', count: 40 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'frio', count: 15 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'descartado', count: 5 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'quente', count: 55 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'morno', count: 180 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'frio', count: 70 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'descartado', count: 35 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'quente', count: 20 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'morno', count: 70 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'frio', count: 320 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'descartado', count: 70 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'quente', count: 15 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'morno', count: 20 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'frio', count: 15 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'descartado', count: 160 },
  // jul para ago.
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'quente', count: 140 },
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'morno', count: 60 },
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'frio', count: 25 },
  { fromColumn: 1, fromCategory: 'quente', toCategory: 'descartado', count: 15 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'quente', count: 35 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'morno', count: 170 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'frio', count: 65 },
  { fromColumn: 1, fromCategory: 'morno', toCategory: 'descartado', count: 40 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'quente', count: 15 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'morno', count: 55 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'frio', count: 280 },
  { fromColumn: 1, fromCategory: 'frio', toCategory: 'descartado', count: 70 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'quente', count: 5 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'morno', count: 15 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'frio', count: 30 },
  { fromColumn: 1, fromCategory: 'descartado', toCategory: 'descartado', count: 220 },
];
