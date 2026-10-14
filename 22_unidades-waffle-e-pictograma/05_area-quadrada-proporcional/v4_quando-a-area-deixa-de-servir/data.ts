/**
 * Cinco totais do trimestre, em reais, que exercitam o limite da área: dois cabem em quadrado, um é
 * 200 vezes menor que o maior, um é saldo negativo e um não foi medido. Dado fictício e fixo.
 *
 * Os reembolsos (R$ 10.200) contra a receita recorrente (R$ 2.040.000) dão razão 200, acima do limite
 * de 100 do componente; o menor viraria uma célula e passa a número com barra. O saldo negativo não
 * tem área e sai com sinal. A receita de parceiros é `null`: ausência, que nunca vira zero.
 */
export interface QuarterTotal {
  readonly id: string;
  /** Nome em minúsculas, porque entra no meio da frase acessível. */
  readonly label: string;
  /** Total em reais; `null` quando o total não está disponível. */
  readonly value: number | null;
  /** Slot categórico (1 a 6) do quadrado, fixo por categoria. */
  readonly slot: number;
}

export interface QuarterTotals {
  readonly period: string;
  /** Quantos reais vale uma célula. */
  readonly unit: number;
  readonly totals: readonly QuarterTotal[];
}

export const data: QuarterTotals = {
  period: '3º trimestre de 2026',
  unit: 10_000,
  totals: [
    { id: 'receita', label: 'receita recorrente', value: 2_040_000, slot: 1 },
    { id: 'custo', label: 'custo de mídia e equipe', value: 1_470_000, slot: 3 },
    { id: 'reembolsos', label: 'reembolsos', value: 10_200, slot: 6 },
    { id: 'saldo', label: 'saldo de caixa', value: -380_000, slot: 5 },
    { id: 'parceiros', label: 'receita de parceiros', value: null, slot: 2 },
  ],
};
