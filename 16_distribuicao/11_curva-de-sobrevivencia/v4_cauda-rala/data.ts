/**
 * Oportunidades com o tempo observado até a decisão, escolhidas para a cauda ficar rala: depois de
 * 180 dias restam só 11 em risco. Dado fictício, determinístico, sem nenhuma correspondência com a
 * base real.
 *
 * `decided: false` é a oportunidade ainda aberta na extração, e `days` é a idade dela naquele dia.
 * O gerador é uma congruência linear com semente fixa; a duração latente de cada caso é Weibull e o
 * caso fica aberto quando a idade na extração é menor que ela. Com a semente abaixo saem 400 casos,
 * 66 abertos, mediana de 58 dias, o maior tempo em 231 dias e 11 casos em risco aos 180 dias.
 */
export interface OpportunityCase {
  readonly days: number;
  readonly decided: boolean;
}

const SEED = 314;
const TOTAL = 400;
const WEIBULL_SHAPE = 1.2;
const WEIBULL_SCALE = 72;
/** Idade na extração: de 20 dias a 320 dias. */
const MIN_AGE = 20;
const AGE_SPAN = 300;

/** Abaixo deste número de casos em risco a queda da curva não é confiável. */
export const LOW_RISK = 15;
/** Dia que a pergunta do cartão olha: o que a curva ainda diz depois dele. */
export const LATE_DAY = 180;
/** Fim do eixo X, fixo: a cauda rala não se estica para ocupar o gráfico. */
export const DOMAIN_END_DAYS = 240;
/** Marcas do eixo X, de 30 em 30 dias. */
export const AXIS_STEP_DAYS = 30;

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

export const data: readonly OpportunityCase[] = buildCases();
