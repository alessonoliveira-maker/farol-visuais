/**
 * Custo por lead (CPL) de cada campanha encerrada, agrupado pelo mês de encerramento, em reais.
 * Dado fictício e fixo: nenhum número corresponde à base real.
 *
 * São 18 meses, de 2025-04 a 2026-09, com de 31 a 68 campanhas por mês. A mediana sobe de cerca de
 * R$ 38 para cerca de R$ 66 e a cauda de campanhas caras engorda com o tempo. A amostra de cada mês
 * sai de um sorteador de semente fixa, igual em qualquer máquina e em qualquer dia.
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

const SEED = 20261017;
/** CPL mínimo e máximo plausíveis, em reais: o limite da métrica, e não o da amostra. */
const MIN_REAIS = 6;
const MAX_REAIS = 240;

const PROFILES: readonly Profile[] = [
  { month: '2025-04', count: 44, median: 38, spread: 0.34 },
  { month: '2025-05', count: 51, median: 40, spread: 0.36 },
  { month: '2025-06', count: 37, median: 39, spread: 0.34 },
  { month: '2025-07', count: 62, median: 42, spread: 0.38 },
  { month: '2025-08', count: 48, median: 41, spread: 0.38 },
  { month: '2025-09', count: 55, median: 44, spread: 0.4 },
  { month: '2025-10', count: 34, median: 46, spread: 0.4 },
  { month: '2025-11', count: 68, median: 45, spread: 0.42 },
  { month: '2025-12', count: 52, median: 49, spread: 0.42 },
  { month: '2026-01', count: 45, median: 52, spread: 0.42 },
  { month: '2026-02', count: 58, median: 51, spread: 0.44 },
  { month: '2026-03', count: 39, median: 55, spread: 0.44 },
  { month: '2026-04', count: 64, median: 58, spread: 0.46 },
  { month: '2026-05', count: 47, median: 57, spread: 0.46 },
  { month: '2026-06', count: 53, median: 61, spread: 0.46 },
  { month: '2026-07', count: 41, median: 63, spread: 0.48 },
  { month: '2026-08', count: 36, median: 64, spread: 0.48 },
  { month: '2026-09', count: 31, median: 66, spread: 0.5 },
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

/** Os 18 meses em ordem cronológica, do mais antigo ao mais recente. */
export const data: readonly MonthCpl[] = build();
