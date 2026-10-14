/**
 * Receita reconhecida por mês de 2026, apurada até 2026-09-14. Meses de janeiro a agosto estão
 * fechados (`forecast` nulo, para a dica não escrever previsto zero); setembro é o mês corrente,
 * com `realizado` parcial e `forecast` sendo o total previsto para o mês inteiro (o componente
 * calcula o restante como `forecast` menos `realizado`, nunca contando o que já foi reconhecido
 * de novo); outubro a dezembro ainda não começaram, com `realizado` zero e `forecast` sendo o
 * total do mês. `meta` é o alvo mensal, em reais. Dado fictício e fixo: nenhuma pessoa ou empresa
 * real é citada.
 */
export interface MonthlyRevenueForecastGoal {
  readonly month: string;
  readonly realizado: number;
  readonly forecast: number | null;
  readonly meta: number;
}

export const data: readonly MonthlyRevenueForecastGoal[] = [
  { month: '2026-01', realizado: 560_000, forecast: null, meta: 600_000 },
  { month: '2026-02', realizado: 610_000, forecast: null, meta: 600_000 },
  { month: '2026-03', realizado: 545_000, forecast: null, meta: 600_000 },
  { month: '2026-04', realizado: 680_000, forecast: null, meta: 650_000 },
  { month: '2026-05', realizado: 720_000, forecast: null, meta: 650_000 },
  { month: '2026-06', realizado: 690_000, forecast: null, meta: 680_000 },
  { month: '2026-07', realizado: 705_000, forecast: null, meta: 680_000 },
  { month: '2026-08', realizado: 660_000, forecast: null, meta: 700_000 },
  { month: '2026-09', realizado: 430_000, forecast: 720_000, meta: 750_000 },
  { month: '2026-10', realizado: 0, forecast: 700_000, meta: 700_000 },
  { month: '2026-11', realizado: 0, forecast: 760_000, meta: 720_000 },
  { month: '2026-12', realizado: 0, forecast: 810_000, meta: 750_000 },
];

/** Mês corrente e data de apuração, para a dica e a linha de leitura não dependerem do relógio. */
export const currentMonth = '2026-09';
export const asOfDate = '2026-09-14';
