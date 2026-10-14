/**
 * Receita reconhecida por mês, com forecast e meta declarados por mês, em reais. `forecast` é o
 * total previsto para o mês inteiro (o componente calcula o restante como `forecast` menos
 * `realizado`, com piso em zero). `realizado` e `forecast` nulos juntos significam que o mês
 * ainda não tem nenhuma leitura (primeiro dia do período); `forecast` nulo sozinho é mês fechado;
 * `meta` nula é mês sem meta cadastrada. Dado fictício e fixo: nenhuma pessoa ou empresa real é
 * citada.
 */
export interface MonthlyForecastRow {
  readonly month: string;
  readonly realizado: number | null;
  readonly forecast: number | null;
  readonly meta: number | null;
}

export const data: readonly MonthlyForecastRow[] = [
  { month: '2026-05', realizado: null, forecast: null, meta: 460_000 },
  { month: '2026-06', realizado: 505_000, forecast: null, meta: 480_000 },
  { month: '2026-07', realizado: 560_000, forecast: 480_000, meta: 520_000 },
  { month: '2026-08', realizado: 470_000, forecast: null, meta: null },
  { month: '2026-09', realizado: 310_000, forecast: 495_000, meta: 500_000 },
];

/** Mês corrente, para a linha de leitura e a dica não dependerem do relógio do navegador. */
export const currentMonth = '2026-09';
