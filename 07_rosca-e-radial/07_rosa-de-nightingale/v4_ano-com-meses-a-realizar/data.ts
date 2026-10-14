/**
 * Investimento em mídia paga por mês de 2026, em reais, até o corte de 2026-09-15.
 * Dado fictício e fixo: nenhum valor corresponde a gasto real.
 */
export interface MonthlySpendStatus {
  readonly month: string;
  readonly status: 'fechado' | 'parcial' | 'a_realizar';
  readonly value?: number;
  readonly asOf?: string;
}

export const data: readonly MonthlySpendStatus[] = [
  { month: '2026-01', status: 'fechado', value: 16_500 },
  { month: '2026-02', status: 'fechado', value: 14_200 },
  { month: '2026-03', status: 'fechado', value: 21_800 },
  { month: '2026-04', status: 'fechado', value: 25_400 },
  { month: '2026-05', status: 'fechado', value: 23_100 },
  { month: '2026-06', status: 'fechado', value: 29_700 },
  { month: '2026-07', status: 'fechado', value: 34_800 },
  { month: '2026-08', status: 'fechado', value: 31_200 },
  { month: '2026-09', status: 'parcial', value: 18_900, asOf: '2026-09-15' },
  { month: '2026-10', status: 'a_realizar' },
  { month: '2026-11', status: 'a_realizar' },
  { month: '2026-12', status: 'a_realizar' },
];
