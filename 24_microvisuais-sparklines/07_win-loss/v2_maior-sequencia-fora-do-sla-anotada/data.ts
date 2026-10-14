/**
 * Resultado do SLA da fila de pré-vendas em 26 semanas seguidas, de segunda a domingo, da semana de
 * 2026-04-06 à de 2026-09-28. `win` fechou dentro do SLA, `loss` fechou fora e `tie` ficou exatamente
 * no limite, sem ser nem uma coisa nem outra. A 18ª semana é um empate no meio de uma série de
 * derrotas: sem ela a sequência fora do SLA teria 7 semanas, com ela o maior trecho é de 6.
 * Dado fictício e fixo.
 */
export type Outcome = 'win' | 'loss' | 'tie' | null;

/** Segunda-feira da primeira semana; as demais seguem de sete em sete dias. */
export const FIRST_WEEK = '2026-04-06';

const W = 'win';
const L = 'loss';
const T = 'tie';

export const data: readonly Outcome[] = [
  W, W, L, W, W, W,
  L, L, L, L, L, L,
  W, W,
  L, L, L, T, L, L, L,
  W, W, W, L, W,
];
