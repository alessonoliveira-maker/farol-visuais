/**
 * Variação mensal do CPL qualificado nos últimos 12 meses, em fração do mês anterior
 * (0,034 é alta de 3,4%). A métrica tem polaridade "menor é melhor". A série traz uma
 * sequência de três altas seguidas no meio (nov/25 a jan/26), o maior valor absoluto numa
 * alta (jan/26), um mês quase parado (mar/26) e o último mês em queda.
 * Dado fictício e fixo.
 */
export interface CplVariationPoint {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Variação contra o mês anterior, em fração. Negativo é queda do CPL. */
  readonly variation: number;
}

export interface CplVariation {
  readonly label: string;
  /** Sentido bom da métrica: 'down' quando cair é melhor (custo), 'up' quando subir é melhor. */
  readonly goodDirection: 'down' | 'up';
  readonly series: readonly CplVariationPoint[];
}

export const data: CplVariation = {
  label: 'CPL qualificado, variação mensal',
  goodDirection: 'down',
  series: [
    { month: '2025-09', variation: -0.021 },
    { month: '2025-10', variation: -0.046 },
    { month: '2025-11', variation: 0.034 },
    { month: '2025-12', variation: 0.058 },
    { month: '2026-01', variation: 0.112 },
    { month: '2026-02', variation: -0.073 },
    { month: '2026-03', variation: -0.003 },
    { month: '2026-04', variation: 0.021 },
    { month: '2026-05', variation: -0.038 },
    { month: '2026-06', variation: -0.052 },
    { month: '2026-07', variation: 0.017 },
    { month: '2026-08', variation: -0.034 },
  ],
};
