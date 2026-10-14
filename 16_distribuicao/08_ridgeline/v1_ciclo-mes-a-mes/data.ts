/**
 * Ciclo de fechamento dos negócios ganhos em cada mês de 2026, em dias corridos entre a criação e o
 * fechamento. Dado fictício e fixo: nenhum número corresponde à base real.
 *
 * Os 12 meses têm n diferente e forma diferente de propósito: a mediana cai de cerca de 64 para
 * cerca de 40 dias e a dispersão encolhe, então o ano não muda só de média, a cauda longa também
 * some. A amostra de cada mês sai de um sorteador de semente fixa, igual em qualquer máquina e em
 * qualquer dia.
 */

export interface MonthCycles {
  readonly id: string;
  /** Mês do fechamento, em `YYYY-MM`. */
  readonly month: string;
  /** Um ciclo por negócio ganho, em dias corridos. */
  readonly cycles: readonly number[];
}

interface Profile {
  readonly month: string;
  readonly count: number;
  readonly median: number;
  readonly spread: number;
}

const SEED = 20261011;
/** Ciclo mínimo e máximo plausíveis, em dias: o limite da métrica, e não o da amostra. */
const MIN_DAYS = 3;
const MAX_DAYS = 200;

const PROFILES: readonly Profile[] = [
  { month: '2026-01', count: 62, median: 64, spread: 0.46 },
  { month: '2026-02', count: 55, median: 62, spread: 0.44 },
  { month: '2026-03', count: 71, median: 63, spread: 0.42 },
  { month: '2026-04', count: 58, median: 57, spread: 0.4 },
  { month: '2026-05', count: 66, median: 55, spread: 0.38 },
  { month: '2026-06', count: 49, median: 56, spread: 0.36 },
  { month: '2026-07', count: 44, median: 50, spread: 0.34 },
  { month: '2026-08', count: 52, median: 48, spread: 0.32 },
  { month: '2026-09', count: 47, median: 47, spread: 0.3 },
  { month: '2026-10', count: 41, median: 44, spread: 0.3 },
  { month: '2026-11', count: 38, median: 42, spread: 0.28 },
  { month: '2026-12', count: 36, median: 40, spread: 0.28 },
];

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

function build(): readonly MonthCycles[] {
  const next = seededUniform(SEED);
  const gauss = (): number => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  return PROFILES.map((profile) => ({
    id: `mes-${profile.month}`,
    month: profile.month,
    cycles: Array.from({ length: profile.count }, () => {
      /** Sorteio refeito quando cai fora dos limites: cortar no teto empilharia valores iguais nele. */
      let days = 0;
      do {
        days = Math.round(profile.median * Math.exp(profile.spread * gauss()));
      } while (days < MIN_DAYS || days > MAX_DAYS);
      return days;
    }),
  }));
}

/** Os 12 meses em ordem cronológica, de janeiro a dezembro. */
export const data: readonly MonthCycles[] = build();
