/**
 * Receita reconhecida em reais, em dois trimestres seguidos com os mesmos quatro passos, na mesma ordem:
 * 2026-T2 (de 1.580.000 a 1.720.000) e 2026-T3 (de 1.720.000 a 1.892.000).
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Totais (`kind: 'total'`) são valores ancorados no zero; passos (`kind: 'step'`) são variações com
 * sinal, cada uma começando onde a anterior terminou. O reajuste de 2026-T3 vale 0 de propósito:
 * zero medido é zero e precisa continuar no desenho.
 * Fechamento 2026-T2: 1.580.000 + 190.000 + 70.000 + 20.000 − 140.000 = 1.720.000.
 * Fechamento 2026-T3: 1.720.000 + 214.000 + 96.000 + 0 − 138.000 = 1.892.000.
 */
export interface BridgeItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly value: number;
}

export interface BridgePanel {
  readonly id: string;
  readonly label: string;
  readonly items: readonly BridgeItem[];
}

export const data: readonly BridgePanel[] = [
  {
    id: 't2',
    label: '2026-T2',
    items: [
      { id: 'inicio', label: 'Início', kind: 'total', value: 1_580_000 },
      { id: 'novos', label: 'Novos', kind: 'step', value: 190_000 },
      { id: 'expansao', label: 'Expansão', kind: 'step', value: 70_000 },
      { id: 'reajuste', label: 'Reajuste', kind: 'step', value: 20_000 },
      { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', value: -140_000 },
      { id: 'fim', label: 'Fim', kind: 'total', value: 1_720_000 },
    ],
  },
  {
    id: 't3',
    label: '2026-T3',
    items: [
      { id: 'inicio', label: 'Início', kind: 'total', value: 1_720_000 },
      { id: 'novos', label: 'Novos', kind: 'step', value: 214_000 },
      { id: 'expansao', label: 'Expansão', kind: 'step', value: 96_000 },
      { id: 'reajuste', label: 'Reajuste', kind: 'step', value: 0 },
      { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', value: -138_000 },
      { id: 'fim', label: 'Fim', kind: 'total', value: 1_892_000 },
    ],
  },
];
