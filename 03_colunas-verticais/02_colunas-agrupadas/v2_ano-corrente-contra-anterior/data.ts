/**
 * Receita reconhecida por mês, 2026 contra o mesmo mês de 2025, em reais.
 * `currentYear` é `null` nos meses de 2026 ainda não fechados (apurado até 2026-08).
 * Dado fictício e fixo: nenhuma pessoa nem empresa real.
 */
export interface YearOverYearRevenue {
  readonly month: string;
  readonly previousYear: number;
  readonly currentYear: number | null;
}

export const data: readonly YearOverYearRevenue[] = [
  { month: '2026-01', previousYear: 162_900, currentYear: 178_200 },
  { month: '2026-02', previousYear: 171_200, currentYear: 183_900 },
  { month: '2026-03', previousYear: 158_400, currentYear: 175_600 },
  { month: '2026-04', previousYear: 179_800, currentYear: 224_100 },
  { month: '2026-05', previousYear: 188_600, currentYear: 231_800 },
  { month: '2026-06', previousYear: 175_300, currentYear: 198_700 },
  { month: '2026-07', previousYear: 162_900, currentYear: 205_300 },
  { month: '2026-08', previousYear: 196_700, currentYear: 279_400 },
  { month: '2026-09', previousYear: 203_100, currentYear: null },
  { month: '2026-10', previousYear: 187_400, currentYear: null },
  { month: '2026-11', previousYear: 195_800, currentYear: null },
  { month: '2026-12', previousYear: 214_300, currentYear: null },
];
