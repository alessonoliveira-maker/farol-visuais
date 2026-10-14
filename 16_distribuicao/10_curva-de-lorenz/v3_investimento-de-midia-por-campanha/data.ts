/**
 * Investimento em mídia paga no ano por campanha, em reais, um valor por campanha. Dado fictício e
 * fixo: nenhum valor corresponde a campanha real.
 *
 * As 1.100 campanhas são uma cauda longa construída por quantis de uma lei de potência (expoente
 * 1,09), com uma variação pequena e fixa por campanha. Nada é sorteado: o mesmo código dá a mesma
 * lista em qualquer máquina. A ordem do array é a de cadastro, embaralhada por um passo coprimo com
 * 1.100, e a curva ordena sozinha.
 */

/** Quantidade de campanhas do ano. */
const CAMPAIGN_COUNT = 1_100;
/** Investimento da menor campanha, em reais, antes da variação. */
const MIN_SPEND = 500;
/** Expoente da lei de potência: quanto menor, mais concentrado o gasto. */
const TAIL_EXPONENT = 1.09;
/** Passo coprimo com 1.100 que embaralha a posição de cada quantil no array. */
const SHUFFLE_STEP = 7;

/** Parte do investimento que a marcação procura: quantas campanhas, das maiores, a alcançam. */
export const SPEND_THRESHOLD = 0.7;

function buildSpends(): readonly number[] {
  const spends: number[] = [];
  let seed = 2_468;
  for (let index = 0; index < CAMPAIGN_COUNT; index += 1) {
    const quantile = (((index * SHUFFLE_STEP) % CAMPAIGN_COUNT) + 0.5) / CAMPAIGN_COUNT;
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
    const jitter = 0.9 + 0.2 * (seed / 4_294_967_296);
    const spend = MIN_SPEND * (1 / (1 - quantile)) ** (1 / TAIL_EXPONENT) * jitter;
    spends.push(Math.round(spend / 10) * 10);
  }
  return spends;
}

/** Investimento em mídia paga no ano por campanha, em reais. */
export const data: readonly number[] = buildSpends();
