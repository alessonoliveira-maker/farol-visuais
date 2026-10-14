/**
 * Receita reconhecida no ano por cliente da carteira, em reais, um valor por cliente. Dado fictício
 * e fixo: nenhum valor corresponde a cliente real.
 *
 * A carteira é uma cauda longa construída por quantis de uma lei de potência (expoente 1,3), com
 * uma variação pequena e fixa por cliente. Nada aqui é sorteado: o mesmo código dá a mesma lista em
 * qualquer máquina. A ordem do array é a de cadastro, embaralhada por um passo coprimo com 640, e é
 * de propósito: a curva de Lorenz ordena sozinha, e quem entregasse a lista já ordenada esconderia
 * que essa ordenação é parte da conta.
 */

/** Quantidade de clientes da carteira. */
const CLIENT_COUNT = 640;
/** Receita do menor cliente, em reais, antes da variação. */
const MIN_REVENUE = 1_800;
/** Expoente da lei de potência: quanto menor, mais concentrada a carteira. */
const TAIL_EXPONENT = 1.3;
/** Passo coprimo com 640 que embaralha a posição de cada quantil no array. */
const SHUFFLE_STEP = 37;

function buildRevenues(): readonly number[] {
  const revenues: number[] = [];
  let seed = 12_345;
  for (let index = 0; index < CLIENT_COUNT; index += 1) {
    const quantile = (((index * SHUFFLE_STEP) % CLIENT_COUNT) + 0.5) / CLIENT_COUNT;
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
    const jitter = 0.9 + 0.2 * (seed / 4_294_967_296);
    const revenue = MIN_REVENUE * (1 / (1 - quantile)) ** (1 / TAIL_EXPONENT) * jitter;
    revenues.push(Math.round(revenue / 10) * 10);
  }
  return revenues;
}

/** Receita reconhecida no ano por cliente, em reais. */
export const data: readonly number[] = buildRevenues();
