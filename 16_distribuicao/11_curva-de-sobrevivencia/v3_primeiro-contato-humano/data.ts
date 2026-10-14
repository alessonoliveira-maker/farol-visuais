/**
 * Leads do mês com o tempo observado até o primeiro contato humano, em minutos. Dado fictício,
 * determinístico, sem nenhuma correspondência com a base real.
 *
 * `reached: true` é o lead que recebeu o primeiro contato, e `minutes` é o tempo de espera até ele.
 * `reached: false` é o lead ainda sem contato no momento da extração, e `minutes` é há quanto tempo
 * ele esperava naquele instante: censura, não espera medida. Tratá-lo como contatado em zero minuto
 * ou descartá-lo faria a espera parecer menor do que foi, e o fim de semana é onde mais pesa.
 *
 * O gerador é uma congruência linear com semente fixa; a espera latente é Weibull e o lead fica sem
 * contato quando a idade na extração é menor que ela. Cada grupo tem a própria semente.
 */
export interface LeadCase {
  readonly minutes: number;
  readonly reached: boolean;
}

export interface LeadGroup {
  readonly key: string;
  /** Nome do grupo, em minúsculas, como entra no meio de frases. */
  readonly label: string;
  /** Slot categórico da cor, fixo por grupo (COR-3). */
  readonly slot: number;
  readonly cases: readonly LeadCase[];
}

/** SLA de primeiro contato humano, em minutos. */
export const SLA_MINUTES = 30;
/** Marcas do eixo X, de 30 em 30 minutos, de modo que o SLA cai numa marca. */
export const AXIS_STEP_MINUTES = 30;

const WEIBULL_SHAPE = 0.9;
/** Idade na extração: de 1 minuto a 481 minutos. */
const MIN_AGE = 1;
const AGE_SPAN = 480;

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildCases(seed: number, total: number, scale: number): LeadCase[] {
  const random = createRandom(seed);
  const cases: LeadCase[] = [];
  for (let index = 0; index < total; index += 1) {
    const wait = scale * Math.pow(-Math.log(1 - random()), 1 / WEIBULL_SHAPE);
    const age = MIN_AGE + random() * AGE_SPAN;
    cases.push(wait <= age ? { minutes: Math.max(1, Math.ceil(wait)), reached: true } : { minutes: Math.max(1, Math.ceil(age)), reached: false });
  }
  return cases;
}

/** Na ordem em que a legenda lista: dia útil primeiro, fim de semana depois. */
export const data: readonly LeadGroup[] = [
  { key: 'dia-util', label: 'dia útil', slot: 1, cases: buildCases(3, 640, 22) },
  { key: 'fim-de-semana', label: 'fim de semana', slot: 3, cases: buildCases(4, 190, 160) },
];
