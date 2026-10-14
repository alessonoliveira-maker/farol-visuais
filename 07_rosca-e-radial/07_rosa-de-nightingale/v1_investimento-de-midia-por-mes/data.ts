/**
 * Investimento em mídia paga por mês de 2025, em reais.
 * Dado fictício e fixo: nenhum valor corresponde a gasto real.
 */
export interface MonthlySpend {
  readonly month: string;
  readonly value: number;
}

export const data: readonly MonthlySpend[] = [
  { month: '2025-01', value: 14_200 },
  { month: '2025-02', value: 12_800 },
  { month: '2025-03', value: 18_400 },
  { month: '2025-04', value: 22_100 },
  { month: '2025-05', value: 19_700 },
  { month: '2025-06', value: 26_300 },
  { month: '2025-07', value: 31_500 },
  { month: '2025-08', value: 28_900 },
  { month: '2025-09', value: 35_200 },
  { month: '2025-10', value: 42_900 },
  { month: '2025-11', value: 24_600 },
  { month: '2025-12', value: 8_400 },
];
