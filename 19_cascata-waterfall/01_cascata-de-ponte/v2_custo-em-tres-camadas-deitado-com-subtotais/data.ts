/**
 * Custo da área em 2026-08, em reais, empilhado em três camadas com subtotal acumulado.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Totais (`kind: 'total'`) são subtotais ancorados no zero; passos (`kind: 'step'`) começam onde o
 * anterior terminou; `gap` é a linha espaçadora entre blocos, sem valor e sem faixa.
 * Fechamento: 92.000 + 68.000 = 160.000; + 140.000 + 32.000 = 332.000; + 58.000 = 390.000.
 */
export interface LayerItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step' | 'gap';
  readonly value: number;
}

export interface LayerReference {
  readonly period: string;
  /** Retorno atribuído à área no período, em reais: a base dos múltiplos por camada. */
  readonly returnValue: number;
}

export const data: readonly LayerItem[] = [
  { id: 'midia', label: 'Mídia paga', kind: 'step', value: 92_000 },
  { id: 'comissoes', label: 'Comissões', kind: 'step', value: 68_000 },
  { id: 'camada-1', label: 'Camada 1, marginal', kind: 'total', value: 160_000 },
  { id: 'vao-1', label: '', kind: 'gap', value: 0 },
  { id: 'equipe', label: 'Equipe da área', kind: 'step', value: 140_000 },
  { id: 'ferramentas', label: 'Ferramentas', kind: 'step', value: 32_000 },
  { id: 'camada-2', label: 'Camada 2, estrutura', kind: 'total', value: 332_000 },
  { id: 'vao-2', label: '', kind: 'gap', value: 0 },
  { id: 'rateio', label: 'Rateio corporativo', kind: 'step', value: 58_000 },
  { id: 'camada-3', label: 'Camada 3, rateio', kind: 'total', value: 390_000 },
];

export const reference: LayerReference = { period: '2026-08', returnValue: 420_000 };
