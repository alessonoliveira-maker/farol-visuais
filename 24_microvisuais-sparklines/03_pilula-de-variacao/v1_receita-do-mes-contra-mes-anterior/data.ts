/**
 * Receita reconhecida no mês, em reais, e as bases contra as quais a pílula de variação é medida.
 * Dado fictício e fixo: nenhum valor vem de empresa real.
 *
 * O caso difícil são as duas faixas: contra o mês anterior a alta é de 7,7% e acende; contra o
 * mesmo mês do ano anterior a diferença é de 0,5% e cai na faixa neutra de 1%, onde o tom vira
 * texto secundário e o glifo vira Minus. As duas bases saem como R$ 1,2 mi e R$ 1,3 mi no formato
 * compacto, e a variação sai dos valores exatos, nunca dos compactos.
 */

/** Para onde aponta o "bom" da métrica; a cor da pílula sai daqui, nunca do sinal. */
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

export interface RevenueBase {
  readonly id: string;
  /** Nome da base, como entra na frase acessível. */
  readonly name: string;
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Valor medido em reais, ou `null` quando a base não foi medida. */
  readonly value: number | null;
}

export interface RevenuePillKpi {
  readonly label: string;
  readonly polarity: Polarity;
  /** Mês corrente no formato YYYY-MM. */
  readonly month: string;
  readonly value: number | null;
  readonly bases: readonly RevenueBase[];
}

export const data: RevenuePillKpi = {
  label: 'Receita reconhecida',
  polarity: 'higher-is-better',
  month: '2026-08',
  value: 1_297_500,
  bases: [
    { id: 'previous-month', name: 'mês anterior', month: '2026-07', value: 1_204_800 },
    { id: 'same-month-last-year', name: 'mesmo mês do ano anterior', month: '2025-08', value: 1_303_900 },
  ],
};
