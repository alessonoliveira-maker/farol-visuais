/**
 * Ciclo de venda mensal, em dias corridos entre a criação da oportunidade e o fechamento ganho.
 * `medianDays` é a mediana do mês; `p25Days` e `p75Days` são o 1º e o 3º quartil, `null` quando
 * `sampleSize` é menor que 10 fechamentos, porque quartil de amostra pequena é ruído, não faixa.
 * Dado fictício e fixo, jan a ago de 2026.
 */
export interface SalesCycleMonth {
  readonly month: string;
  readonly medianDays: number;
  readonly p25Days: number | null;
  readonly p75Days: number | null;
  readonly sampleSize: number;
}

export const MIN_SAMPLE = 10;

export const data: readonly SalesCycleMonth[] = [
  { month: '2026-01', medianDays: 48, p25Days: 36, p75Days: 63, sampleSize: 14 },
  { month: '2026-02', medianDays: 45, p25Days: 34, p75Days: 59, sampleSize: 16 },
  /** Amostra pequena: caso difícil em que a faixa é omitida por regra, não por falta de dado. */
  { month: '2026-03', medianDays: 52, p25Days: null, p75Days: null, sampleSize: 8 },
  { month: '2026-04', medianDays: 50, p25Days: 38, p75Days: 64, sampleSize: 12 },
  { month: '2026-05', medianDays: 47, p25Days: 35, p75Days: 61, sampleSize: 11 },
  { month: '2026-06', medianDays: 55, p25Days: null, p75Days: null, sampleSize: 9 },
  { month: '2026-07', medianDays: 44, p25Days: 33, p75Days: 57, sampleSize: 13 },
  { month: '2026-08', medianDays: 41, p25Days: 31, p75Days: 53, sampleSize: 15 },
];
