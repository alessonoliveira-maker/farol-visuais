/**
 * Receita recorrente nova por mês, em reais, nos últimos 12 meses fechados.
 * O último ponto é o período atual; o penúltimo é o de comparação. Dado fictício e fixo.
 * `value: null` é mês sem medição: a linha quebra ali e nada vira zero.
 */
export interface MonthlyPoint {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Valor medido, ou `null` quando não houve medição no mês. */
  readonly value: number | null;
}

export interface KpiTrend {
  readonly label: string;
  /** Para onde aponta o "bom": subir é bom para receita, descer é bom para custo. */
  readonly goodDirection: 'up' | 'down';
  readonly series: readonly MonthlyPoint[];
}

export const data: KpiTrend = {
  label: 'Receita recorrente nova',
  goodDirection: 'up',
  series: [
    { month: '2025-09', value: 118_400 },
    { month: '2025-10', value: 131_900 },
    { month: '2025-11', value: 124_300 },
    { month: '2025-12', value: 109_800 },
    { month: '2026-01', value: 127_600 },
    { month: '2026-02', value: 139_200 },
    { month: '2026-03', value: 151_700 },
    { month: '2026-04', value: 146_100 },
    { month: '2026-05', value: 158_900 },
    { month: '2026-06', value: 171_400 },
    { month: '2026-07', value: 162_900 },
    { month: '2026-08', value: 184_300 },
  ],
};
