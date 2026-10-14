/**
 * Custo da área em reais, 2026-08 contra 2026-07, como árvore: cada nó traz a base (mês anterior) e o
 * valor atual, e a variação é a diferença. Os filhos de um nó somam a base e o atual dele.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface CostNode {
  readonly id: string;
  readonly label: string;
  /** Valor no mês anterior. */
  readonly base: number;
  /** Valor no mês corrente. */
  readonly current: number;
  readonly children?: readonly CostNode[];
}

export interface CostChangeTree {
  /** Mês corrente, em YYYY-MM. */
  readonly period: string;
  /** Mês da base, em YYYY-MM. */
  readonly basePeriod: string;
  readonly root: CostNode;
}

export const data: CostChangeTree = {
  period: '2026-08',
  basePeriod: '2026-07',
  root: {
    id: 'custo',
    label: 'Custo total',
    base: 364_000,
    current: 390_000,
    children: [
      {
        id: 'pessoas',
        label: 'Pessoas',
        base: 156_000,
        current: 160_000,
        children: [
          { id: 'folha', label: 'Folha', base: 120_000, current: 123_000 },
          { id: 'beneficios', label: 'Benefícios', base: 36_000, current: 37_000 },
        ],
      },
      {
        id: 'marketing',
        label: 'Marketing',
        base: 127_000,
        current: 150_000,
        children: [
          { id: 'eventos', label: 'Eventos', base: 7_000, current: 6_000 },
          { id: 'agencia', label: 'Agência', base: 10_000, current: 12_000 },
          { id: 'midia', label: 'Mídia', base: 99_000, current: 118_000 },
          { id: 'ferramentas', label: 'Ferramentas', base: 11_000, current: 14_000 },
        ],
      },
      { id: 'comissao', label: 'Comissão', base: 25_000, current: 22_000 },
      { id: 'rateio', label: 'Rateio', base: 56_000, current: 58_000 },
    ],
  },
};
