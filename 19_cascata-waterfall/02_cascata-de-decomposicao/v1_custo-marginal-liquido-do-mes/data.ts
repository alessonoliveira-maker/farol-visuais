/**
 * Custo marginal líquido do mês de 2026-08, em reais: a soma das partes é o custo, construído a
 * partir do zero. Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * As partes vêm da maior para a menor; o desconto de fornecedor (valor negativo) vai por último e
 * é o que justifica a cascata no lugar da barra simples. O total não mora aqui: o componente o
 * obtém somando as partes. Fechamento: 118.000 + 22.000 + 14.000 + 6.000 − 8.000 = 152.000.
 */
export interface CostPart {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

export interface MarginalCost {
  /** Mês no formato YYYY-MM. */
  readonly period: string;
  readonly parts: readonly CostPart[];
}

export const data: MarginalCost = {
  period: '2026-08',
  parts: [
    { id: 'midia', label: 'Mídia', value: 118_000 },
    { id: 'comissao', label: 'Comissão', value: 22_000 },
    { id: 'ferramentas', label: 'Ferramentas', value: 14_000 },
    { id: 'brindes', label: 'Brindes', value: 6_000 },
    { id: 'desconto', label: 'Desconto de fornecedor', value: -8_000 },
  ],
};
