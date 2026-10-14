/**
 * Receita reconhecida em reais em 2026-T3, em duas unidades com a mesma ponte de quatro passos.
 * Dado fictício e fixo: nenhuma unidade é empresa real.
 * A Unidade Norte não separa a expansão no financeiro: o passo vale `null` (não medido), que é
 * diferente de 0 (medido e zerado, como o reajuste da Unidade Sul). O fim da Norte é parcial por
 * isso: início mais os passos medidos, 1.050.000 + 140.000 + 20.000 − 95.000 = 1.115.000, sem somar
 * zero no lugar da expansão.
 * Fechamento da Unidade Sul: 1.240.000 + 180.000 + 90.000 + 0 − 110.000 = 1.400.000.
 */
export interface BridgeItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  /** `null` é passo não medido; só passo (`kind: 'step'`) pode ser `null`. */
  readonly value: number | null;
  /** Total que deixou de somar passo não medido. */
  readonly partial?: boolean;
}

export interface BridgePanel {
  readonly id: string;
  readonly label: string;
  readonly items: readonly BridgeItem[];
}

export const data: readonly BridgePanel[] = [
  {
    id: 'sul',
    label: 'Unidade Sul',
    items: [
      { id: 'inicio', label: 'Início', kind: 'total', value: 1_240_000 },
      { id: 'novos', label: 'Novos', kind: 'step', value: 180_000 },
      { id: 'expansao', label: 'Expansão', kind: 'step', value: 90_000 },
      { id: 'reajuste', label: 'Reajuste', kind: 'step', value: 0 },
      { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', value: -110_000 },
      { id: 'fim', label: 'Fim', kind: 'total', value: 1_400_000 },
    ],
  },
  {
    id: 'norte',
    label: 'Unidade Norte',
    items: [
      { id: 'inicio', label: 'Início', kind: 'total', value: 1_050_000 },
      { id: 'novos', label: 'Novos', kind: 'step', value: 140_000 },
      { id: 'expansao', label: 'Expansão', kind: 'step', value: null },
      { id: 'reajuste', label: 'Reajuste', kind: 'step', value: 20_000 },
      { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', value: -95_000 },
      { id: 'fim', label: 'Fim', kind: 'total', value: 1_115_000, partial: true },
    ],
  },
];
