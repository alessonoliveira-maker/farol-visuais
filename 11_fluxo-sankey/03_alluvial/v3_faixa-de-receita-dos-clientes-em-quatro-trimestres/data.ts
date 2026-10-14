/**
 * Faixa de receita mensal dos mesmos 312 clientes em quatro trimestres seguidos, do trimestre que
 * fecha em dezembro de 2025 ao que fecha em setembro de 2026. Dado fictício e fixo: cada linha de
 * `data` é o número de clientes que estava numa faixa no trimestre de origem e apareceu em outra
 * (ou na mesma) no trimestre seguinte.
 *
 * A POPULAÇÃO É FECHADA DE PROPÓSITO, e é isso que o modelo exige: "Ainda não cliente" e "Encerrou"
 * entram como categorias de primeira classe, então a soma de toda coluna é sempre 312 e a altura das
 * quatro colunas fecha. Sem elas, quem entra e quem sai da base sumiria e a leitura mentiria, que é
 * a primeira linha do "Quando evitar" deste modelo.
 *
 * As faixas são nomeadas pelo intervalo de receita MENSAL por cliente, e o trimestre é nomeado pelo
 * mês em que fecha, porque abreviar trimestre seria sigla inventada (ROT-8).
 */
export interface RevenueBandCategory {
  readonly id: string;
  readonly label: string;
  /**
   * Papel da categoria no desenho. `band` é faixa de receita e recebe cor de slot; `notYet` é quem
   * ainda não entrou na base e sai vazado, com contorno; `churned` é quem saiu e fica em neutro
   * cheio. As duas fora da base vão por último, abaixo das faixas, e não consomem slot de cor
   * (COR-4: a categoria de ausência não entra no teto de seis).
   */
  readonly role: 'band' | 'notYet' | 'churned';
  /**
   * Posição fixa na paleta categórica (COR-8: ordem 1, 3, 6, 5), ou `null` nas duas categorias fora
   * da base, que são neutras. A mesma faixa tem a mesma cor nas quatro colunas.
   */
  readonly slot: 1 | 3 | 5 | 6 | null;
}

export interface RevenueColumn {
  readonly id: string;
  /** Mês de fechamento do trimestre, em YYYY-MM, usado por `formatMonthShort`. */
  readonly month: string;
}

export interface RevenueFlow {
  /** Índice do par de colunas: 0 liga a coluna 0 à 1, 1 liga a 1 à 2, 2 liga a 2 à 3. */
  readonly fromColumn: number;
  readonly fromCategory: string;
  readonly toCategory: string;
  readonly count: number;
}

/**
 * Ordem fixa nas quatro colunas, da faixa mais alta para a mais baixa e depois as duas de fora da
 * base. É a POSIÇÃO que carrega a ordem das faixas, e não a cor: ver a nota do `meta.json` sobre a
 * rampa sequencial que a especificação pedia.
 */
export const categories: readonly RevenueBandCategory[] = [
  { id: 'acima-40', label: 'Acima de R$ 40 mil', role: 'band', slot: 1 },
  { id: 'de-15-a-40', label: 'R$ 15 a 40 mil', role: 'band', slot: 3 },
  { id: 'de-5-a-15', label: 'R$ 5 a 15 mil', role: 'band', slot: 6 },
  { id: 'ate-5', label: 'Até R$ 5 mil', role: 'band', slot: 5 },
  { id: 'ainda-nao', label: 'Ainda não cliente', role: 'notYet', slot: null },
  { id: 'encerrou', label: 'Encerrou', role: 'churned', slot: null },
];

export const columns: readonly RevenueColumn[] = [
  { id: 't4-2025', month: '2025-12' },
  { id: 't1-2026', month: '2026-03' },
  { id: 't2-2026', month: '2026-06' },
  { id: 't3-2026', month: '2026-09' },
];

export const data: readonly RevenueFlow[] = [
  // Trimestre de dez/25 para o de mar/26.
  { fromColumn: 0, fromCategory: 'acima-40', toCategory: 'acima-40', count: 16 },
  { fromColumn: 0, fromCategory: 'acima-40', toCategory: 'de-15-a-40', count: 4 },
  { fromColumn: 0, fromCategory: 'de-15-a-40', toCategory: 'acima-40', count: 6 },
  { fromColumn: 0, fromCategory: 'de-15-a-40', toCategory: 'de-15-a-40', count: 34 },
  { fromColumn: 0, fromCategory: 'de-15-a-40', toCategory: 'de-5-a-15', count: 4 },
  { fromColumn: 0, fromCategory: 'de-15-a-40', toCategory: 'encerrou', count: 4 },
  { fromColumn: 0, fromCategory: 'de-5-a-15', toCategory: 'de-15-a-40', count: 10 },
  { fromColumn: 0, fromCategory: 'de-5-a-15', toCategory: 'de-5-a-15', count: 58 },
  { fromColumn: 0, fromCategory: 'de-5-a-15', toCategory: 'ate-5', count: 4 },
  { fromColumn: 0, fromCategory: 'de-5-a-15', toCategory: 'encerrou', count: 4 },
  { fromColumn: 0, fromCategory: 'ate-5', toCategory: 'de-5-a-15', count: 10 },
  { fromColumn: 0, fromCategory: 'ate-5', toCategory: 'ate-5', count: 44 },
  { fromColumn: 0, fromCategory: 'ate-5', toCategory: 'encerrou', count: 6 },
  { fromColumn: 0, fromCategory: 'ainda-nao', toCategory: 'de-15-a-40', count: 4 },
  { fromColumn: 0, fromCategory: 'ainda-nao', toCategory: 'de-5-a-15', count: 6 },
  { fromColumn: 0, fromCategory: 'ainda-nao', toCategory: 'ate-5', count: 12 },
  { fromColumn: 0, fromCategory: 'ainda-nao', toCategory: 'ainda-nao', count: 78 },
  { fromColumn: 0, fromCategory: 'encerrou', toCategory: 'encerrou', count: 8 },
  // Trimestre de mar/26 para o de jun/26.
  { fromColumn: 1, fromCategory: 'acima-40', toCategory: 'acima-40', count: 18 },
  { fromColumn: 1, fromCategory: 'acima-40', toCategory: 'de-15-a-40', count: 4 },
  { fromColumn: 1, fromCategory: 'de-15-a-40', toCategory: 'acima-40', count: 6 },
  { fromColumn: 1, fromCategory: 'de-15-a-40', toCategory: 'de-15-a-40', count: 38 },
  { fromColumn: 1, fromCategory: 'de-15-a-40', toCategory: 'de-5-a-15', count: 4 },
  { fromColumn: 1, fromCategory: 'de-15-a-40', toCategory: 'encerrou', count: 4 },
  { fromColumn: 1, fromCategory: 'de-5-a-15', toCategory: 'de-15-a-40', count: 10 },
  { fromColumn: 1, fromCategory: 'de-5-a-15', toCategory: 'de-5-a-15', count: 60 },
  { fromColumn: 1, fromCategory: 'de-5-a-15', toCategory: 'ate-5', count: 4 },
  { fromColumn: 1, fromCategory: 'de-5-a-15', toCategory: 'encerrou', count: 4 },
  { fromColumn: 1, fromCategory: 'ate-5', toCategory: 'de-5-a-15', count: 10 },
  { fromColumn: 1, fromCategory: 'ate-5', toCategory: 'ate-5', count: 44 },
  { fromColumn: 1, fromCategory: 'ate-5', toCategory: 'encerrou', count: 6 },
  { fromColumn: 1, fromCategory: 'ainda-nao', toCategory: 'de-15-a-40', count: 4 },
  { fromColumn: 1, fromCategory: 'ainda-nao', toCategory: 'de-5-a-15', count: 6 },
  { fromColumn: 1, fromCategory: 'ainda-nao', toCategory: 'ate-5', count: 10 },
  { fromColumn: 1, fromCategory: 'ainda-nao', toCategory: 'ainda-nao', count: 58 },
  { fromColumn: 1, fromCategory: 'encerrou', toCategory: 'encerrou', count: 22 },
  // Trimestre de jun/26 para o de set/26.
  { fromColumn: 2, fromCategory: 'acima-40', toCategory: 'acima-40', count: 20 },
  { fromColumn: 2, fromCategory: 'acima-40', toCategory: 'de-15-a-40', count: 4 },
  { fromColumn: 2, fromCategory: 'de-15-a-40', toCategory: 'acima-40', count: 8 },
  { fromColumn: 2, fromCategory: 'de-15-a-40', toCategory: 'de-15-a-40', count: 40 },
  { fromColumn: 2, fromCategory: 'de-15-a-40', toCategory: 'de-5-a-15', count: 4 },
  { fromColumn: 2, fromCategory: 'de-15-a-40', toCategory: 'encerrou', count: 4 },
  { fromColumn: 2, fromCategory: 'de-5-a-15', toCategory: 'de-15-a-40', count: 12 },
  { fromColumn: 2, fromCategory: 'de-5-a-15', toCategory: 'de-5-a-15', count: 60 },
  { fromColumn: 2, fromCategory: 'de-5-a-15', toCategory: 'ate-5', count: 4 },
  { fromColumn: 2, fromCategory: 'de-5-a-15', toCategory: 'encerrou', count: 4 },
  { fromColumn: 2, fromCategory: 'ate-5', toCategory: 'de-5-a-15', count: 8 },
  { fromColumn: 2, fromCategory: 'ate-5', toCategory: 'ate-5', count: 44 },
  { fromColumn: 2, fromCategory: 'ate-5', toCategory: 'encerrou', count: 6 },
  { fromColumn: 2, fromCategory: 'ainda-nao', toCategory: 'de-15-a-40', count: 4 },
  { fromColumn: 2, fromCategory: 'ainda-nao', toCategory: 'de-5-a-15', count: 4 },
  { fromColumn: 2, fromCategory: 'ainda-nao', toCategory: 'ate-5', count: 8 },
  { fromColumn: 2, fromCategory: 'ainda-nao', toCategory: 'ainda-nao', count: 42 },
  { fromColumn: 2, fromCategory: 'encerrou', toCategory: 'encerrou', count: 36 },
];
