/**
 * Resultado do SLA da fila de pré-vendas em 26 semanas seguidas, de segunda a domingo, da semana de
 * 2026-04-06 à de 2026-09-28. `win` é a semana que fechou dentro do SLA e `loss` a que fechou fora.
 * `tie` (exatamente no limite) e `null` (sem dado) fazem parte do tipo, mas este recorte não os usa.
 * Dado fictício e fixo.
 */
export type Outcome = 'win' | 'loss' | 'tie' | null;

/** Segunda-feira da primeira semana; as demais seguem de sete em sete dias. */
export const FIRST_WEEK = '2026-04-06';

const W = 'win';
const L = 'loss';

/** 19 semanas dentro do SLA, 7 fora, e as 5 últimas seguidas dentro. */
export const data: readonly Outcome[] = [
  W, W, L, W, W, W, L,
  W, L, L, W, W, W, L,
  W, W, L, W, W, W, L,
  W, W, W, W, W,
];
