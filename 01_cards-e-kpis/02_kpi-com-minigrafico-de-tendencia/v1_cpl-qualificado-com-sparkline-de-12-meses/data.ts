/**
 * Custo por lead qualificado (CPL qualificado), em reais, por mês fechado, nos últimos 12 meses.
 * O último ponto é o mês atual; o penúltimo é o mês de comparação da variação.
 * `value: null` é mês sem coleta de mídia: a linha quebra ali, nunca vira zero.
 * Dado fictício e fixo.
 */
export interface MonthlyCplPoint {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** CPL qualificado do mês, em reais, ou `null` quando a fonte não coletou. */
  readonly value: number | null;
}

export interface CplTrend {
  readonly label: string;
  /** Para onde aponta o "bom": CPL caindo é bom, por isso 'down'. */
  readonly goodDirection: 'up' | 'down';
  readonly series: readonly MonthlyCplPoint[];
}

export const data: CplTrend = {
  label: 'CPL qualificado',
  goodDirection: 'down',
  series: [
    { month: '2025-09', value: 342 },
    { month: '2025-10', value: 356 },
    { month: '2025-11', value: 331 },
    { month: '2025-12', value: null },
    { month: '2026-01', value: 318 },
    { month: '2026-02', value: 305 },
    { month: '2026-03', value: 296 },
    { month: '2026-04', value: 288 },
    { month: '2026-05', value: 274 },
    { month: '2026-06', value: 261 },
    { month: '2026-07', value: 249 },
    { month: '2026-08', value: 231 },
  ],
};
