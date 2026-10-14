/**
 * Custo da área em 2026-08, em reais, como árvore de dois níveis: o custo total se abre em quatro
 * passos e o passo de marketing se abre em quatro parcelas que somam o valor dele.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface CostNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly children?: readonly CostNode[];
}

export interface CostTree {
  /** Mês do custo, em YYYY-MM. */
  readonly period: string;
  readonly root: CostNode;
  /** Passo do primeiro nível que está aberto no desenho. */
  readonly openId: string;
}

export const data: CostTree = {
  period: '2026-08',
  openId: 'marketing',
  root: {
    id: 'custo',
    label: 'Custo total',
    value: 390_000,
    children: [
      { id: 'pessoas', label: 'Pessoas', value: 160_000 },
      {
        id: 'marketing',
        label: 'Marketing',
        value: 150_000,
        children: [
          { id: 'midia', label: 'Mídia', value: 118_000 },
          { id: 'ferramentas', label: 'Ferramentas', value: 14_000 },
          { id: 'agencia', label: 'Agência', value: 12_000 },
          { id: 'eventos', label: 'Eventos', value: 6_000 },
        ],
      },
      { id: 'comissao', label: 'Comissão', value: 22_000 },
      { id: 'rateio', label: 'Rateio', value: 58_000 },
    ],
  },
};
