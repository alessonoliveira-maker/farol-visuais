/**
 * Entradas de leads por mês simuladas em doze cenários de orçamento de mídia, em contagem: cada
 * cenário traz 400 desfechos do simulador, um por rodada. Dado fictício e fixo: nenhum orçamento,
 * custo ou teto corresponde a empresa real.
 *
 * O simulador sorteia o custo por entrada de cada rodada e divide o orçamento por ele. A operação
 * atende no máximo 300 entradas por mês, então todo desfecho que passaria disso é registrado em 300:
 * o teto não é um valor provável como os outros, é uma parede, e nos orçamentos altos a maior parte
 * das rodadas bate nela. Essa massa parada no teto é o caso difícil desta versão: uma densidade
 * suavizada a espalharia para os lados, como se 290 e 300 fossem igualmente comuns.
 *
 * Os doze cenários cobrem os três regimes: orçamentos baixos em que nenhuma rodada chega ao teto,
 * zero medido e não ausência; a transição, com poucas rodadas no teto; e os dois maiores, em que
 * mais da metade das rodadas para nele e a própria mediana é o teto.
 *
 * Os desfechos saem de um gerador com semente fixa, escrito aqui mesmo: a mesma semente devolve os
 * mesmos números em qualquer máquina e em qualquer dia.
 */
export interface BudgetScenario {
  readonly id: string;
  /** Orçamento mensal de mídia do cenário, em reais. */
  readonly budget: number;
  /** Entradas por mês, uma por rodada do simulador, já limitadas ao teto de atendimento. */
  readonly outcomes: readonly number[];
}

/** Teto fictício de atendimento, em entradas por mês. */
export const CEILING = 300;

/** Rodadas do simulador por cenário. */
const RUNS = 400;
/** Custo mediano por entrada, em reais, e a dispersão dele entre as rodadas. */
const COST_MEDIAN = 400;
const COST_SPREAD = 0.16;
const FIRST_BUDGET = 20_000;
const BUDGET_STEP = 10_000;
const SCENARIOS = 12;

/** Gerador de 32 bits com semente fixa: o sorteio é reproduzível, e não depende de relógio. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Entradas de um cenário: orçamento dividido por um custo log-normal, com o teto aplicado. */
function simulate(seed: number, budget: number): readonly number[] {
  const next = seededRandom(seed);
  return Array.from({ length: RUNS }, () => {
    const first = Math.max(next(), 1e-9);
    const second = next();
    const normal = Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    const cost = COST_MEDIAN * Math.exp(COST_SPREAD * normal);
    return Math.min(CEILING, Math.round(budget / cost));
  });
}

export const data: readonly BudgetScenario[] = Array.from({ length: SCENARIOS }, (_, index) => {
  const budget = FIRST_BUDGET + index * BUDGET_STEP;
  return { id: `orcamento-${String(budget / 1000)}-mil`, budget, outcomes: simulate(100 + index, budget) };
});
