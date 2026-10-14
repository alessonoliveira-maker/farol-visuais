/**
 * Receita reconhecida mensal em reais, jan a dez de 2026. `real` é o valor medido e fica nulo
 * a partir de ago/2026; os percentis (`p05`, `p25`, `median`, `p75`, `p95`) ficam nulos até
 * jun/2026 e passam a existir de jul/2026 em diante. Método declarado: bootstrap da variação
 * mensal dos últimos 12 meses (2.000 reamostragens), aplicado sobre o último valor real; a
 * partir daqui o desenho deixa de ser medição e vira estimativa. Em jul/2026, o mês de junção,
 * os cinco percentis colapsam no próprio valor real, para o leque não nascer solto.
 * Dado fictício e fixo.
 */
export interface RevenueMonth {
  readonly month: string;
  readonly real: number | null;
  readonly p05: number | null;
  readonly p25: number | null;
  readonly median: number | null;
  readonly p75: number | null;
  readonly p95: number | null;
}

export const data: readonly RevenueMonth[] = [
  { month: '2026-01', real: 312_400, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-02', real: 318_900, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-03', real: 305_100, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-04', real: 331_600, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-05', real: 340_800, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-06', real: 337_500, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-07', real: 355_200, p05: 355_200, p25: 355_200, median: 355_200, p75: 355_200, p95: 355_200 },
  { month: '2026-08', real: null, p05: 322_000, p25: 344_500, median: 366_000, p75: 388_000, p95: 412_000 },
  { month: '2026-09', real: null, p05: 298_000, p25: 349_000, median: 375_000, p75: 402_000, p95: 441_000 },
  { month: '2026-10', real: null, p05: 279_000, p25: 353_000, median: 384_000, p75: 416_000, p95: 471_000 },
  { month: '2026-11', real: null, p05: 258_000, p25: 358_000, median: 394_000, p75: 431_000, p95: 502_000 },
  { month: '2026-12', real: null, p05: 236_000, p25: 363_000, median: 405_000, p75: 447_000, p95: 533_000 },
];

/** Último mês medido: o ponto de junção onde o leque abre. */
export const todayMonth = '2026-07';
