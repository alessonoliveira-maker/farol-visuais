/**
 * Oportunidades de 2026 por origem, com o tempo observado até a decisão. Dado fictício,
 * determinístico, sem nenhuma correspondência com a base real.
 *
 * `decided: false` é a oportunidade ainda aberta na extração, e `days` é a idade dela naquele dia.
 * A mídia paga tem proporção maior de casos abertos que a indicação, e é exatamente isso que faz a
 * comparação só entre as encerradas favorecer a mídia paga: as longas dela ainda estão abertas.
 *
 * O gerador é uma congruência linear com semente fixa; a duração latente de cada caso é Weibull e o
 * caso fica aberto quando a idade na extração é menor que ela. Cada origem tem a própria semente.
 */
export interface OpportunityCase {
  readonly days: number;
  readonly decided: boolean;
}

export interface OriginGroup {
  readonly key: string;
  /** Nome da origem, em minúsculas, como entra no meio de frases. */
  readonly label: string;
  /** Slot categórico da cor, fixo por origem (COR-3). */
  readonly slot: number;
  readonly cases: readonly OpportunityCase[];
}

const WEIBULL_SHAPE = 1.2;
/** Idade na extração: de 20 dias a 320 dias. */
const MIN_AGE = 20;
const AGE_SPAN = 300;

/** Marcas do eixo X, de 30 em 30 dias. */
export const AXIS_STEP_DAYS = 30;

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildCases(seed: number, total: number, scale: number): OpportunityCase[] {
  const random = createRandom(seed);
  const cases: OpportunityCase[] = [];
  for (let index = 0; index < total; index += 1) {
    const duration = scale * Math.pow(-Math.log(1 - random()), 1 / WEIBULL_SHAPE);
    const age = MIN_AGE + random() * AGE_SPAN;
    cases.push(duration <= age ? { days: Math.max(1, Math.ceil(duration)), decided: true } : { days: Math.max(1, Math.ceil(age)), decided: false });
  }
  return cases;
}

/** Na ordem em que a legenda lista: indicação primeiro, mídia paga depois. */
export const data: readonly OriginGroup[] = [
  { key: 'indicacao', label: 'indicação', slot: 1, cases: buildCases(11, 210, 46) },
  { key: 'midia-paga', label: 'mídia paga', slot: 3, cases: buildCases(9, 330, 105) },
];
