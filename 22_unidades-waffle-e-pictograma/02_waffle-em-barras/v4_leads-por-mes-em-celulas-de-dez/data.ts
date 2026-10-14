/**
 * Leads captados por mês no marketing, de abril a setembro de 2026. Dado fictício e fixo: nenhum
 * número é de operação real.
 *
 * O caso difícil está nos meses: junho passa de 300 (347) e obriga a célula a valer 10 leads, o que
 * deixa 347 com a última célula em 70%; julho não teve coleta (null, e não zero); agosto mediu zero.
 */
export interface MonthLeads {
  readonly id: string;
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Leads captados; null quando o mês não teve coleta, que é diferente de zero medido. */
  readonly leads: number | null;
}

export const data: readonly MonthLeads[] = [
  { id: 'mes-04', month: '2026-04', leads: 212 },
  { id: 'mes-05', month: '2026-05', leads: 278 },
  { id: 'mes-06', month: '2026-06', leads: 347 },
  { id: 'mes-07', month: '2026-07', leads: null },
  { id: 'mes-08', month: '2026-08', leads: 0 },
  { id: 'mes-09', month: '2026-09', leads: 156 },
];
