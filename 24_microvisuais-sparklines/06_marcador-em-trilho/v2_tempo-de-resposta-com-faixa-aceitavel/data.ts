/**
 * Tempo mediano de primeira resposta da pré-vendas, em minutos, por semana.
 * Dado fictício e fixo. Casos difíceis de propósito: uma semana sem coleta (`null`, nunca zero),
 * uma semana histórica muito acima das outras (a escala do trilho vai até ela) e a semana atual
 * fora da faixa aceitável do SLA.
 */
export interface ResponseTimeData {
  readonly label: string;
  /** Início da semana atual, em `YYYY-MM-DD`. */
  readonly weekStart: string;
  /** Mediana da semana atual, em minutos; `null` quando não houve coleta. */
  readonly current: number | null;
  /** Medianas semanais anteriores, em minutos, que dão o mínimo e o máximo históricos. */
  readonly history: readonly (number | null)[];
  /** Faixa aceitável, em minutos, com a fonte dela declarada. */
  readonly sla: { readonly from: number; readonly to: number; readonly source: string };
}

export const data: ResponseTimeData = {
  label: 'Primeira resposta',
  weekStart: '2026-09-28',
  current: 38,
  history: [14, 22, 9, 31, 18, null, 27, 12, 95, 41, 16, 8, 2, 25, 33, 19, 11, 29, 36, 21],
  sla: { from: 5, to: 30, source: 'SLA contratado' },
};
