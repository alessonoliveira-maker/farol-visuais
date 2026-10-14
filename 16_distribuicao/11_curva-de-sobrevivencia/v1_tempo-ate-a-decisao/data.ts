/**
 * Oportunidades de 2026 com o tempo observado até a decisão. Dado fictício, determinístico, sem
 * nenhuma correspondência com a base real.
 *
 * Cada linha é um caso: `days` é o tempo observado e `decided` diz se ele termina em evento. O evento
 * é a decisão, ganho ou perda: perda nunca vira censura, porque tratá-la como "ainda aberta" faria a
 * curva descer devagar e inflaria a chance de ganhar. `decided: false` é a oportunidade ainda aberta
 * na extração, e `days` é a idade dela naquele dia, não o tempo até um desfecho que ainda não existe.
 *
 * O gerador é uma congruência linear com semente fixa, para o dado nunca mudar entre renders. A
 * duração latente de cada caso é Weibull; o caso fica aberto quando a idade na extração é menor que
 * essa duração. Com a semente abaixo saem 520 casos, 87 abertos e mediana de 58 dias.
 */
export interface OpportunityCase {
  readonly days: number;
  readonly decided: boolean;
}

const SEED = 347;
const TOTAL = 520;
const WEIBULL_SHAPE = 1.2;
const WEIBULL_SCALE = 72;
/** Idade na extração: de 20 dias a 320 dias. */
const MIN_AGE = 20;
const AGE_SPAN = 300;

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildCases(): OpportunityCase[] {
  const random = createRandom(SEED);
  const cases: OpportunityCase[] = [];
  for (let index = 0; index < TOTAL; index += 1) {
    const duration = WEIBULL_SCALE * Math.pow(-Math.log(1 - random()), 1 / WEIBULL_SHAPE);
    const age = MIN_AGE + random() * AGE_SPAN;
    cases.push(duration <= age ? { days: Math.max(1, Math.ceil(duration)), decided: true } : { days: Math.max(1, Math.ceil(age)), decided: false });
  }
  return cases;
}

/** Marcas do eixo X, de 30 em 30 dias, até o maior tempo observado arredondado para cima. */
export const AXIS_STEP_DAYS = 30;

export const data: readonly OpportunityCase[] = buildCases();
