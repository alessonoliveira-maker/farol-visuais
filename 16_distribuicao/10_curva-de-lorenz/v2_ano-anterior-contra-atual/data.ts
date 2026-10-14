/**
 * Receita reconhecida por cliente em dois anos fechados, em reais, um valor por cliente de cada ano.
 * Dado fictício e fixo: nenhum valor corresponde a cliente real.
 *
 * Cada ano é uma cauda longa construída por quantis de uma lei de potência, com uma variação pequena
 * e fixa por cliente. Nada é sorteado: o mesmo código dá a mesma lista em qualquer máquina. O ano
 * anterior tem menos clientes e a cauda mais curta (expoente 1,45); o atual tem 42 clientes a mais e
 * a cauda mais pesada (expoente 1,25), que é a concentração que a comparação precisa mostrar.
 */

export interface YearRevenue {
  /** Nome do ano como aparece na legenda e na frase de leitura. */
  readonly label: string;
  /** Receita reconhecida no ano por cliente, em reais. */
  readonly revenues: readonly number[];
}

export interface RevenueComparison {
  readonly previous: YearRevenue;
  readonly current: YearRevenue;
}

interface YearSpec {
  readonly count: number;
  readonly minRevenue: number;
  readonly exponent: number;
  /** Passo coprimo com `count` que embaralha a posição de cada quantil no array. */
  readonly step: number;
  readonly seed: number;
}

function buildRevenues({ count, minRevenue, exponent, step, seed: initialSeed }: YearSpec): readonly number[] {
  const revenues: number[] = [];
  let seed = initialSeed;
  for (let index = 0; index < count; index += 1) {
    const quantile = (((index * step) % count) + 0.5) / count;
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;
    const jitter = 0.9 + 0.2 * (seed / 4_294_967_296);
    const revenue = minRevenue * (1 / (1 - quantile)) ** (1 / exponent) * jitter;
    revenues.push(Math.round(revenue / 10) * 10);
  }
  return revenues;
}

export const data: RevenueComparison = {
  previous: {
    label: '2024',
    revenues: buildRevenues({ count: 598, minRevenue: 1_800, exponent: 1.45, step: 37, seed: 4_242 }),
  },
  current: {
    label: '2025',
    revenues: buildRevenues({ count: 640, minRevenue: 1_900, exponent: 1.25, step: 37, seed: 9_876 }),
  },
};
