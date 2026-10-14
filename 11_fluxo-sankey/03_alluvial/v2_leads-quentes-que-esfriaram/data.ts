/**
 * Temperatura dos mesmos 1.036 leads em dois meses seguidos (jul e ago de 2026). Dado fictício e
 * fixo: cada linha de `data` é o volume de leads que estava numa temperatura em julho e foi para
 * outra (ou a mesma) em agosto. A soma das linhas com a mesma `fromCategory` bate com o total
 * daquela categoria em julho, e a soma por `toCategory` bate com o total em agosto: a população
 * nunca muda, só a classificação dela.
 *
 * `highlight` é o dado que responde à pergunta da versão, e por isso mora aqui e não no componente:
 * quantos dos 214 leads Quentes esfriaram. As duas transições de Quente para uma temperatura mais
 * baixa são as únicas que ficam em cor de categoria; todas as outras vão para o neutro.
 */
export interface AlluvialCategory {
  readonly id: string;
  readonly label: string;
  /**
   * Posição fixa da categoria na paleta categórica (CONTRATO, COR-8): a mesma categoria tem a
   * mesma cor nas duas colunas, na ordem de atribuição 1, 3, 6, 5 (2 e 4 ficam de fora porque
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
  /** Índice do par de colunas: 0 liga a coluna 0 à 1. O campo fica para o layout servir a 3 ou 4 colunas sem mudança. */
  readonly fromColumn: number;
  readonly fromCategory: string;
  readonly toCategory: string;
  readonly count: number;
}

/** Uma transição em foco: o par de categorias que a pergunta da tela quer ver acesa. */
export interface AlluvialTransition {
  readonly fromCategory: string;
  readonly toCategory: string;
}

/** Ordem fixa nas duas colunas: é ela que deixa o olho rastrear o bloco sem ler o rótulo de novo. */
export const categories: readonly AlluvialCategory[] = [
  { id: 'quente', label: 'Quente', slot: 1 },
  { id: 'morno', label: 'Morno', slot: 3 },
  { id: 'frio', label: 'Frio', slot: 6 },
  { id: 'descartado', label: 'Descartado', slot: 5 },
];

export const columns: readonly AlluvialColumn[] = [
  { id: 'jul', month: '2026-07' },
  { id: 'ago', month: '2026-08' },
];

/**
 * Esfriar é descer de temperatura, então só as saídas de Quente para Morno e para Frio entram. A
 * saída para Descartado não é esfriar: é sair da base, e misturar as duas inflaria a resposta.
 */
export const highlight: readonly AlluvialTransition[] = [
  { fromCategory: 'quente', toCategory: 'morno' },
  { fromCategory: 'quente', toCategory: 'frio' },
];

export const data: readonly AlluvialFlow[] = [
  // jul para ago. Os 214 Quentes de julho se repartem nas quatro primeiras linhas.
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'quente', count: 132 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'morno', count: 46 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'frio', count: 21 },
  { fromColumn: 0, fromCategory: 'quente', toCategory: 'descartado', count: 15 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'quente', count: 38 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'morno', count: 165 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'frio', count: 45 },
  { fromColumn: 0, fromCategory: 'morno', toCategory: 'descartado', count: 20 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'quente', count: 12 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'morno', count: 58 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'frio', count: 288 },
  { fromColumn: 0, fromCategory: 'frio', toCategory: 'descartado', count: 44 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'quente', count: 3 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'morno', count: 9 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'frio', count: 25 },
  { fromColumn: 0, fromCategory: 'descartado', toCategory: 'descartado', count: 115 },
];
