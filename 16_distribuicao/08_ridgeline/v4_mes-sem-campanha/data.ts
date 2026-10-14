/**
 * Custo por lead (CPL) de cada campanha encerrada, agrupado pelo mês de encerramento, em reais.
 * Dado fictício e fixo: nenhum número corresponde à base real.
 *
 * São 7 meses, de 2026-01 a 2026-07, com lacunas de propósito: março não teve campanha ativa (lista
 * vazia, que é ausência e não zero) e abril teve só 11, abaixo do piso de 30 para estimar curva. Os
 * outros cinco têm de 34 a 61. A amostra de cada mês sai de um sorteador de semente fixa, igual em
 * qualquer máquina e em qualquer dia.
 */

export interface MonthCpl {
  readonly id: string;
  /** Mês de encerramento das campanhas, em `YYYY-MM`. */
  readonly month: string;
  /** Um CPL por campanha encerrada no mês, em reais. */
  readonly costs: readonly number[];
}

interface Profile {
  readonly month: string;
  readonly count: number;
  readonly median: number;
  readonly spread: number;
}

const SEED = 20261019;
/** CPL mínimo e máximo plausíveis, em reais: o limite da métrica, e não o da amostra. */
const MIN_REAIS = 6;
const MAX_REAIS = 240;

const PROFILES: readonly Profile[] = [
  { month: '2026-01', count: 41, median: 44, spread: 0.36 },
  { month: '2026-02', count: 53, median: 46, spread: 0.38 },
  { month: '2026-03', count: 0, median: 0, spread: 0.4 },
  { month: '2026-04', count: 11, median: 52, spread: 0.4 },
  { month: '2026-05', count: 34, median: 55, spread: 0.42 },
  { month: '2026-06', count: 61, median: 58, spread: 0.42 },
  { month: '2026-07', count: 47, median: 61, spread: 0.44 },
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

function build(): readonly MonthCpl[] {
  const next = seededUniform(SEED);
  const gauss = (): number => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  return PROFILES.map((profile) => ({
    id: `mes-${profile.month}`,
    month: profile.month,
    costs: Array.from({ length: profile.count }, () => {
      /** Sorteio refeito quando cai fora dos limites: cortar no teto empilharia valores iguais nele. */
      let reais = 0;
      do {
        reais = Math.round(profile.median * Math.exp(profile.spread * gauss()) * 10) / 10;
      } while (reais < MIN_REAIS || reais > MAX_REAIS);
      return reais;
    }),
  }));
}

/** Os 7 meses em ordem cronológica, com março vazio e abril com amostra pequena. */
export const data: readonly MonthCpl[] = build();
