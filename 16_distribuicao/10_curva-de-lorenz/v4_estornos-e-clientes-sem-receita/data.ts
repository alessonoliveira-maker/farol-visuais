/**
 * Receita líquida por cliente no período, em reais, um valor por cliente. Dado fictício e fixo:
 * nenhum valor corresponde a cliente real.
 *
 * São 400 clientes. 264 têm receita positiva, construída por quantis de uma lei de potência com uma
 * variação pequena e fixa; 113 têm receita zero medida, que é 30% dos 377 clientes sem estorno; e 23
 * têm saldo negativo por estorno de lançamento. Nada é sorteado: o mesmo código dá a mesma lista em
 * qualquer máquina. A ordem do array é a de cadastro, embaralhada por um passo coprimo com 400,
 * porque a curva ordena sozinha e zero e negativo não vêm agrupados na vida real.
 */

/** Clientes com receita positiva. */
const POSITIVE_COUNT = 264;
/** Clientes com receita zero medida: 113 de 377, que são 30% dos clientes sem estorno. */
const ZERO_COUNT = 113;
/** Clientes com saldo negativo por estorno. */
const REFUND_COUNT = 23;
/** Receita do menor cliente positivo, em reais, antes da variação. */
const MIN_REVENUE = 1_500;
/** Expoente da lei de potência: quanto menor, mais concentrada a carteira. */
const TAIL_EXPONENT = 1.25;
/** Passo coprimo com 264 que embaralha a posição de cada quantil dos positivos. */
const QUANTILE_STEP = 7;
/** Passo coprimo com 400 que embaralha a posição de cada cliente no array final. */
const SHUFFLE_STEP = 57;

function buildRevenues(): readonly number[] {
  const positives: number[] = [];
  let seed = 7_531;
  for (let index = 0; index < POSITIVE_COUNT; index += 1) {
    const quantile = (((index * QUANTILE_STEP) % POSITIVE_COUNT) + 0.5) / POSITIVE_COUNT;
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
    const jitter = 0.9 + 0.2 * (seed / 4_294_967_296);
    positives.push(Math.round((MIN_REVENUE * (1 / (1 - quantile)) ** (1 / TAIL_EXPONENT) * jitter) / 10) * 10);
  }
  const zeros = Array.from({ length: ZERO_COUNT }, () => 0);
  const refunds = Array.from({ length: REFUND_COUNT }, (_, index) => -(300 + ((index * 397) % 3_700)));
  const grouped = [...positives, ...zeros, ...refunds];
  const shuffled: number[] = Array.from({ length: grouped.length }, () => 0);
  grouped.forEach((value, index) => {
    shuffled[(index * SHUFFLE_STEP) % grouped.length] = value;
  });
  return shuffled;
}

/** Receita líquida por cliente no período, em reais; negativo é saldo de estorno. */
export const data: readonly number[] = buildRevenues();
