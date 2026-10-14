/**
 * Resultado operacional mensal de uma empresa fictícia de médio porte, em reais, ao longo de
 * um ano corrido. Pode ser positivo (lucro) ou negativo (prejuízo), e cruza o zero várias
 * vezes. Dado fictício e fixo.
 */
export interface MonthlyResult {
  readonly month: string;
  readonly result: number;
}

export const data: readonly MonthlyResult[] = [
  { month: '2025-01', result: 82_400 },
  { month: '2025-02', result: 54_200 },
  { month: '2025-03', result: -21_800 },
  { month: '2025-04', result: -38_100 },
  { month: '2025-05', result: 8_700 },
  { month: '2025-06', result: 61_300 },
  { month: '2025-07', result: 73_900 },
  { month: '2025-08', result: -12_400 },
  { month: '2025-09', result: -46_700 },
  { month: '2025-10', result: 28_600 },
  { month: '2025-11', result: 39_200 },
  { month: '2025-12', result: 91_500 },
];
