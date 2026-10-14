/**
 * Custo por lead (CPL) de campanhas de dois canais de mídia paga no ano, em reais por lead.
 * Dado fictício e fixo: nenhuma correspondência com a base real.
 *
 * Cada canal traz uma observação por campanha, com n diferente de propósito (172 contra 134): a
 * densidade de cada um é normalizada para área 1, e é isso que deixa duas amostras de tamanhos
 * distintos comparáveis na mesma curva. Os dois canais têm forma diferente. A busca é compacta,
 * com a maioria das campanhas perto de R$ 140. O social é mais largo e tem cauda direita longa,
 * onde moram as campanhas caras. As curvas se cruzam no meio, e é essa região que a peça marca.
 * A amostra sai de um sorteador de semente fixa, igual em qualquer máquina e em qualquer dia.
 */

export interface ChannelSample {
  readonly id: string;
  readonly name: string;
  /** O canal com a preposição, para entrar no meio de uma frase sem maiúscula: "na busca". */
  readonly inPhrase: string;
  /** Um CPL por campanha, em reais. */
  readonly values: readonly number[];
}

const SEED = 20261006;
const SEARCH_COUNT = 172;
const SEARCH_MEAN = 170;
const SEARCH_SPREAD = 42;
const SOCIAL_COUNT = 134;
const SOCIAL_LOG_MEDIAN = 246;
const SOCIAL_LOG_SPREAD = 0.3;
/** Menor CPL plausível, em reais: a métrica não é negativa. */
const FLOOR = 30;

/** Sorteador determinístico de 32 bits: a mesma semente devolve a mesma sequência. */
function seededUniform(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): readonly ChannelSample[] {
  const next = seededUniform(SEED);
  const gauss = (): number => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  const search = Array.from({ length: SEARCH_COUNT }, () =>
    Math.round(Math.max(FLOOR, SEARCH_MEAN + SEARCH_SPREAD * gauss())),
  );
  const social = Array.from({ length: SOCIAL_COUNT }, () =>
    Math.round(Math.max(FLOOR, SOCIAL_LOG_MEDIAN * Math.exp(SOCIAL_LOG_SPREAD * gauss()))),
  );
  return [
    { id: 'search', name: 'Busca', inPhrase: 'na busca', values: search },
    { id: 'social', name: 'Social', inPhrase: 'no social', values: social },
  ];
}

/** Os dois canais, na ordem em que a legenda os lista. */
export const data: readonly ChannelSample[] = build();
