/**
 * Receita acumulada em reais, jan a dez de 2026, contra a meta anual fictícia de R$ 4,2
 * milhões. `real` é o acumulado medido e fica nulo a partir de ago/2026; os percentis nascem em
 * jul/2026 (ponto de junção, colapsados no valor real) e seguem até dez/2026. Método declarado:
 * bootstrap da variação mensal dos últimos 12 meses (2.000 reamostragens), acumulado mês a mês
 * sobre o último valor real; a partir de ago/2026 o desenho é estimativa, não medição. As
 * faixas não são espelhadas: o lado de cima cresce mais que o de baixo, porque o upside de
 * receita nova tem cauda mais longa que o downside de perda de contrato. Dado fictício e fixo.
 */
export interface CumulativeMonth {
  readonly month: string;
  readonly real: number | null;
  readonly p05: number | null;
  readonly p25: number | null;
  readonly median: number | null;
  readonly p75: number | null;
  readonly p95: number | null;
}

export const data: readonly CumulativeMonth[] = [
  { month: '2026-01', real: 312_400, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-02', real: 631_300, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-03', real: 936_400, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-04', real: 1_268_000, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-05', real: 1_608_800, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-06', real: 1_946_300, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-07', real: 2_301_500, p05: 2_301_500, p25: 2_301_500, median: 2_301_500, p75: 2_301_500, p95: 2_301_500 },
  { month: '2026-08', real: null, p05: 2_600_000, p25: 2_660_000, median: 2_700_000, p75: 2_745_000, p95: 2_820_000 },
  { month: '2026-09', real: null, p05: 2_860_000, p25: 2_980_000, median: 3_050_000, p75: 3_140_000, p95: 3_280_000 },
  { month: '2026-10', real: null, p05: 3_110_000, p25: 3_300_000, median: 3_420_000, p75: 3_560_000, p95: 3_790_000 },
  { month: '2026-11', real: null, p05: 3_360_000, p25: 3_630_000, median: 3_790_000, p75: 3_980_000, p95: 4_320_000 },
  { month: '2026-12', real: null, p05: 3_650_000, p25: 3_970_000, median: 4_170_000, p75: 4_410_000, p95: 4_760_000 },
];

/** Último mês medido: o ponto de junção onde o leque abre. */
export const todayMonth = '2026-07';

/** Meta anual fictícia de receita acumulada. */
export const goal = 4_200_000;
