/**
 * Leads que entraram por mês, no total e os que passaram pela qualificação, de nov/25 a out/26.
 * Dado fictício e fixo: nenhum número vem de campanha ou empresa real.
 *
 * O caso difícil é a relação entre as duas séries: em out/26 os qualificados crescem 12% e os
 * totais só 1,9%, e a frase precisa dizer isso na ordem certa. Se a relação inverter, a ordem das
 * séries na frase, o verbo e o conector mudam junto, porque saem do dado e não de um texto fixo.
 */

export interface MonthlyLeads {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Todos os leads que entraram no mês, ou `null` sem medição. */
  readonly total: number | null;
  /** Leads que passaram pela qualificação, ou `null` sem medição. */
  readonly qualified: number | null;
}

export const data: readonly MonthlyLeads[] = [
  { month: '2025-11', total: 1180, qualified: 286 },
  { month: '2025-12', total: 1210, qualified: 298 },
  { month: '2026-01', total: 1090, qualified: 281 },
  { month: '2026-02', total: 1260, qualified: 322 },
  { month: '2026-03', total: 1305, qualified: 331 },
  { month: '2026-04', total: 1350, qualified: 349 },
  { month: '2026-05', total: 1320, qualified: 352 },
  { month: '2026-06', total: 1390, qualified: 361 },
  { month: '2026-07', total: 1410, qualified: 372 },
  { month: '2026-08', total: 1385, qualified: 368 },
  { month: '2026-09', total: 1440, qualified: 392 },
  { month: '2026-10', total: 1468, qualified: 438 },
];
