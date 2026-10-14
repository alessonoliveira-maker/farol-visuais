/**
 * Receita reconhecida por mês, em reais, de out/25 a set/26, para a frase de KPI em texto corrido.
 * Dado fictício e fixo: nenhum valor vem de empresa real.
 *
 * O caso difícil é o arredondamento: em formato compacto set/26 sai R$ 1,2 mi e ago/26 sai
 * R$ 1,1 mi, mas a variação impressa vem dos valores exatos e dá 8,4%, não dos arredondados.
 * O último mês também é o ponto final da sparkline, então os dois precisam ler o mesmo número.
 */

/** Para onde aponta o "bom" da métrica; a cor da variação sai daqui, nunca do sinal. */
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

export interface RevenueMonth {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Receita em reais, ou `null` quando não houve medição no mês. */
  readonly value: number | null;
}

export interface RevenueTrend {
  readonly polarity: Polarity;
  /** Meses em ordem cronológica; o último é o mês da frase. */
  readonly months: readonly RevenueMonth[];
}

export const data: RevenueTrend = {
  polarity: 'higher-is-better',
  months: [
    { month: '2025-10', value: 1_012_400 },
    { month: '2025-11', value: 1_038_900 },
    { month: '2025-12', value: 1_106_200 },
    { month: '2026-01', value: 947_300 },
    { month: '2026-02', value: 981_500 },
    { month: '2026-03', value: 1_044_700 },
    { month: '2026-04', value: 1_073_200 },
    { month: '2026-05', value: 1_091_800 },
    { month: '2026-06', value: 1_128_600 },
    { month: '2026-07', value: 1_097_400 },
    { month: '2026-08', value: 1_149_000 },
    { month: '2026-09', value: 1_246_000 },
  ],
};
