/**
 * Cobertura mensal do campo telefone: leads com telefone válido sobre leads do mês, de 2025-10 a
 * 2026-09, em contagem de leads. Os meses anteriores à mudança de coleta não foram recalculados.
 * Dado fictício e fixo.
 */
export interface CoverageMonth {
  readonly month: string;
  readonly covered: number;
  readonly total: number;
}

export interface CoverageSeries {
  readonly months: readonly CoverageMonth[];
  /** Data da mudança de coleta, em YYYY-MM-DD; o mês dela leva a anotação. */
  readonly collectionChange: string;
}

export const data: CoverageSeries = {
  collectionChange: '2026-06-15',
  months: [
    { month: '2025-10', covered: 254, total: 1_210 },
    { month: '2025-11', covered: 260, total: 1_180 },
    { month: '2025-12', covered: 240, total: 1_090 },
    { month: '2026-01', covered: 317, total: 1_320 },
    { month: '2026-02', covered: 288, total: 1_250 },
    { month: '2026-03', covered: 304, total: 1_380 },
    { month: '2026-04', covered: 322, total: 1_340 },
    { month: '2026-05', covered: 297, total: 1_290 },
    { month: '2026-06', covered: 860, total: 1_410 },
    { month: '2026-07', covered: 870, total: 1_450 },
    { month: '2026-08', covered: 862, total: 1_390 },
    { month: '2026-09', covered: 903, total: 1_480 },
  ],
};
