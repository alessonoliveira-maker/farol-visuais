/**
 * Entradas de leads por semana na pré-venda, 52 semanas seguidas de segunda a domingo, da semana de
 * 2025-10-13 à semana corrente, que começa em 2026-10-05. `null` é semana sem coleta: não é zero e
 * nunca ocupa a menor classe. A última semana está em curso e o valor é parcial até `AS_OF`.
 * Dado fictício e fixo.
 */
export type WeekEntries = number | null;

/** Segunda-feira da primeira semana; as demais seguem de sete em sete dias. */
export const FIRST_WEEK = '2025-10-13';

/** Último dia medido: a semana corrente ainda não fechou. */
export const AS_OF = '2026-10-07';

/** Cortes redondos das três classes: abaixo de 50, de 50 a 79 e 80 ou mais. */
export const CUTOFFS: readonly number[] = [50, 80];

export const data: readonly WeekEntries[] = [
  58, 64, 71, 77, 83, 88, 74, 61, 52, 44,
  31, 28, 46, 63, 79, 92, 104, 111, 97, 86,
  null, null, 72, 66, 81, 94, 102, 108, 99, 87,
  78, 69, 74, 82, 91, 105, 113, 107, 96, 84,
  70, 62, 55, 49, 43, 38, 41, 57, 68, 76,
  85, 47,
];
