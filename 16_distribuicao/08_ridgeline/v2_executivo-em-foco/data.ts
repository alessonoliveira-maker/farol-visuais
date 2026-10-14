/**
 * Ciclo de fechamento dos negócios ganhos por executivo, em dias corridos entre a criação e o
 * fechamento. Dado fictício e fixo: os nomes são inventados, com inicial de sobrenome, e nenhum
 * número corresponde à base real.
 *
 * São 12 executivos com n de 31 a 62 negócios, em ordem de cadastro e não de mediana: quem ordena é
 * o componente. A mediana de cada um e a dispersão são próprias, e Maria Eduarda F. tem o nome mais
 * longo da lista. A amostra sai de um sorteador de semente fixa, igual em qualquer máquina e em
 * qualquer dia.
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

const SEED = 20261013;
/** Ciclo mínimo e máximo plausíveis, em dias: o limite da métrica, e não o da amostra. */
const MIN_DAYS = 3;
const MAX_DAYS = 200;

const PROFILES: readonly Profile[] = [
  { id: 'exec-01', name: 'Caio R.', count: 44, median: 61, spread: 0.36 },
  { id: 'exec-02', name: 'Talita V.', count: 62, median: 37, spread: 0.34 },
  { id: 'exec-03', name: 'Heitor L.', count: 37, median: 70, spread: 0.42 },
  { id: 'exec-04', name: 'Murilo C.', count: 52, median: 45, spread: 0.4 },
  { id: 'exec-05', name: 'Maria Eduarda F.', count: 41, median: 65, spread: 0.46 },
  { id: 'exec-06', name: 'Renan A.', count: 49, median: 52, spread: 0.38 },
  { id: 'exec-07', name: 'Bianca T.', count: 31, median: 88, spread: 0.4 },
  { id: 'exec-08', name: 'Débora S.', count: 46, median: 56, spread: 0.44 },
  { id: 'exec-09', name: 'Otávio B.', count: 33, median: 80, spread: 0.38 },
  { id: 'exec-10', name: 'Lívia M.', count: 35, median: 75, spread: 0.3 },
  { id: 'exec-11', name: 'Ícaro N.', count: 40, median: 48, spread: 0.32 },
  { id: 'exec-12', name: 'Valéria P.', count: 32, median: 95, spread: 0.36 },
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
      /** Sorteio refeito quando cai fora dos limites: cortar no teto empilharia valores iguais nele. */
      let days = 0;
      do {
        days = Math.round(profile.median * Math.exp(profile.spread * gauss()));
      } while (days < MIN_DAYS || days > MAX_DAYS);
      return days;
    }),
  }));
}

/** Os 12 executivos, em ordem de cadastro. */
export const data: readonly ExecutiveCycles[] = build();

/** O executivo em foco por padrão: no Farol, quem manda é o filtro da página. */
export const highlightId = 'exec-01';
