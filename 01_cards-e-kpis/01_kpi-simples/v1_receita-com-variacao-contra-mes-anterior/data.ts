/**
 * Receita reconhecida no mês, em reais, e a do mês anterior como base da variação.
 * Dado fictício e fixo: nenhum valor vem de empresa real.
 *
 * O caso difícil é o arredondamento: em formato compacto o mês atual sai R$ 1,2 mi e o anterior
 * R$ 1,1 mi, o que sugere 9,1% de alta; a variação certa sai dos valores exatos e dá 8,4%.
 */

/** Para onde aponta o "bom" da métrica; a cor da variação sai daqui, nunca do sinal. */
export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

export interface MonthValue {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Valor medido em reais, ou `null` quando não houve medição no mês. */
  readonly value: number | null;
}

export interface MonthlyRevenueKpi {
  readonly label: string;
  readonly polarity: Polarity;
  readonly current: MonthValue;
  readonly previous: MonthValue;
  /** Motivo impresso quando o mês atual não tem medição. */
  readonly unavailableReason?: string;
}

export const data: MonthlyRevenueKpi = {
  label: 'Receita reconhecida',
  polarity: 'higher-is-better',
  current: { month: '2026-08', value: 1_246_300 },
  previous: { month: '2026-07', value: 1_149_700 },
  unavailableReason: 'fechamento do mês ainda não carregado',
};
