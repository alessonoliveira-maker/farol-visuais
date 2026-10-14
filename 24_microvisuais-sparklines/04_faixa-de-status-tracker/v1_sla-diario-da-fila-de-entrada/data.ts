/**
 * Tempo mediano até o primeiro contato da fila de entrada, em minutos, um valor por dia de
 * 2026-09-01 a 2026-09-30. `null` é dia sem coleta: não é zero e não entra na conta.
 * Dado fictício e fixo. O dia 15 fica exatamente no limite do SLA, para provar que o limite conta
 * como dentro.
 */
export type DayMinutes = number | null;

/** Primeiro dia da série; os demais seguem um por posição, sem lacuna de calendário. */
export const FIRST_DAY = '2026-09-01';

/** Limite do SLA de primeiro contato, em minutos. */
export const SLA_MINUTES = 15;

export const data: readonly DayMinutes[] = [
  9, 11, 8, 12, 14, 10, 9, 13, null, 11,
  12, 8, 10, 14, 15, 11, null, 9, 12, 13,
  10, 11, 14, 12, 19, 13, 11, 22, 12, 10,
];
