/**
 * Receita reconhecida por mês fechado, em reais, nos últimos 12 meses da área Comercial.
 * O último ponto é o mês atual. O melhor mês fica no meio da série (não é o último) e o piso
 * vem logo no início, para a sparkline exercitar os dois extremos e o ponto final separados.
 * Dado fictício e fixo.
 */
export interface MonthlyRevenuePoint {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Receita reconhecida do mês, em reais. */
  readonly value: number;
}

export interface RevenueTrend {
  readonly label: string;
  readonly series: readonly MonthlyRevenuePoint[];
}

export const data: RevenueTrend = {
  label: 'Receita reconhecida',
  series: [
    { month: '2025-09', value: 1_620_000 },
    { month: '2025-10', value: 1_580_000 },
    { month: '2025-11', value: 1_710_000 },
    { month: '2025-12', value: 1_940_000 },
    { month: '2026-01', value: 1_760_000 },
    { month: '2026-02', value: 1_890_000 },
    { month: '2026-03', value: 2_310_000 },
    { month: '2026-04', value: 2_050_000 },
    { month: '2026-05', value: 2_120_000 },
    { month: '2026-06', value: 1_980_000 },
    { month: '2026-07', value: 2_090_000 },
    { month: '2026-08', value: 2_140_000 },
  ],
};
