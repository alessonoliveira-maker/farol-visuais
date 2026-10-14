/**
 * Ciclo de fechamento dos negócios ganhos por executivo, em dias corridos entre a criação e o
 * fechamento. Dado fictício e fixo: os nomes são inventados, com inicial de sobrenome, e nenhum
 * número corresponde à base real.
 *
 * São 12 executivos com n diferente de propósito. Dez têm amostra de 31 a 58 negócios, e dois
 * (Ícaro N. e Valéria P.) têm menos de 15: a tira deles não pode inventar uma forma, e a peça
 * hachura e rotula. A amostra de cada pessoa sai de um sorteador de semente fixa, com mediana e
 * dispersão próprias, igual em qualquer máquina e em qualquer dia.
 */

export interface ExecutiveCycles {
  readonly id: string;
  readonly name: string;
  /** Um ciclo por negócio ganho, em dias corridos. */
  readonly cycles: readonly number[];
}

interface Profile {
  readonly id: string;
  readonly name: string;
  readonly count: number;
  readonly median: number;
  readonly spread: number;
}

const SEED = 20261007;
/** Ciclo mínimo e máximo plausíveis, em dias: o limite da métrica, e não o da amostra. */
const MIN_DAYS = 3;
const MAX_DAYS = 240;

const PROFILES: readonly Profile[] = [
  { id: 'exec-01', name: 'Talita V.', count: 58, median: 36, spread: 0.34 },
  { id: 'exec-02', name: 'Murilo C.', count: 52, median: 44, spread: 0.4 },
  { id: 'exec-03', name: 'Renan A.', count: 49, median: 51, spread: 0.38 },
  { id: 'exec-04', name: 'Débora S.', count: 46, median: 55, spread: 0.46 },
  { id: 'exec-05', name: 'Caio R.', count: 44, median: 60, spread: 0.36 },
  { id: 'exec-06', name: 'Maria Eduarda F.', count: 41, median: 64, spread: 0.5 },
  { id: 'exec-07', name: 'Heitor L.', count: 37, median: 69, spread: 0.42 },
  { id: 'exec-08', name: 'Lívia M.', count: 35, median: 74, spread: 0.3 },
  { id: 'exec-09', name: 'Otávio B.', count: 32, median: 80, spread: 0.44 },
  { id: 'exec-10', name: 'Bianca T.', count: 31, median: 88, spread: 0.4 },
  { id: 'exec-11', name: 'Ícaro N.', count: 13, median: 58, spread: 0.4 },
  { id: 'exec-12', name: 'Valéria P.', count: 9, median: 92, spread: 0.35 },
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

function build(): readonly ExecutiveCycles[] {
  const next = seededUniform(SEED);
  const gauss = (): number => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  return PROFILES.map((profile) => ({
    id: profile.id,
    name: profile.name,
    cycles: Array.from({ length: profile.count }, () => {
      const days = Math.round(profile.median * Math.exp(profile.spread * gauss()));
      return Math.min(MAX_DAYS, Math.max(MIN_DAYS, days));
    }),
  }));
}

/** Os 12 executivos, em ordem de cadastro: quem ordena por mediana é o componente. */
export const data: readonly ExecutiveCycles[] = build();
