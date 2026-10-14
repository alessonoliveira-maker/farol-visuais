/**
 * Receita reconhecida em reais em 2026-T3: o plano e o realizado numa mesma ponte de quatro passos.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Totais (`kind: 'total'`) são valores ancorados no zero; passos (`kind: 'step'`) são variações com
 * sinal, cada uma começando onde a anterior terminou. `polarity` diz qual direção da grandeza do
 * passo é a boa: em `higher` mais é melhor, em `lower` menos é melhor (cancelamento acima do plano
 * é piora, mesmo escrito com sinal de menos na ponte).
 * Fechamento do plano: 1.720.000 + 260.000 + 80.000 + 30.000 − 90.000 = 2.000.000.
 * Fechamento do realizado: 1.720.000 + 214.000 + 96.000 + 0 − 138.000 = 1.892.000.
 * Contra o plano: novos −46.000, expansão +16.000, reajuste −30.000, cancelamentos +48.000 acima.
 */
export interface PlanActualItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly polarity: 'higher' | 'lower';
  readonly plan: number;
  readonly actual: number;
}

export interface PlanActualBridge {
  readonly period: string;
  readonly items: readonly PlanActualItem[];
}

export const data: PlanActualBridge = {
  period: '2026-T3',
  items: [
    { id: 'inicio', label: 'Início', kind: 'total', polarity: 'higher', plan: 1_720_000, actual: 1_720_000 },
    { id: 'novos', label: 'Novos contratos', kind: 'step', polarity: 'higher', plan: 260_000, actual: 214_000 },
    { id: 'expansao', label: 'Expansão', kind: 'step', polarity: 'higher', plan: 80_000, actual: 96_000 },
    { id: 'reajuste', label: 'Reajuste', kind: 'step', polarity: 'higher', plan: 30_000, actual: 0 },
    { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', polarity: 'lower', plan: -90_000, actual: -138_000 },
    { id: 'fim', label: 'Fim', kind: 'total', polarity: 'higher', plan: 2_000_000, actual: 1_892_000 },
  ],
};
