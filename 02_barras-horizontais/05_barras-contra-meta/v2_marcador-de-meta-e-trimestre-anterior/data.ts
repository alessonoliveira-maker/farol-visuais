/**
 * Receita reconhecida por executivo no trimestre de jul/26 a set/26, em reais, com a meta
 * individual do mesmo trimestre e o realizado do trimestre anterior (abr/26 a jun/26).
 * Dado fictício e fixo: nomes inventados, nenhum é pessoa real.
 */
export interface QuarterTarget {
  readonly id: string;
  readonly name: string;
  /** Receita reconhecida no trimestre atual, em reais. */
  readonly actual: number;
  /** Meta individual do trimestre atual, em reais. */
  readonly target: number;
  /** Receita do trimestre anterior, em reais; null quando a pessoa ainda não estava no time. */
  readonly previous: number | null;
}

/** Um trimestre como mês inicial e final, em YYYY-MM. */
export interface QuarterRange {
  readonly start: string;
  readonly end: string;
}

export const data: readonly QuarterTarget[] = [
  { id: 'exec-11', name: 'Bianca L.', actual: 512_300, target: 490_000, previous: 457_400 },
  { id: 'exec-12', name: 'Caio N.', actual: 438_900, target: 420_000, previous: 471_200 },
  { id: 'exec-13', name: 'Débora P.', actual: 356_100, target: 400_000, previous: 298_700 },
  { id: 'exec-14', name: 'Vitória Helena S.', actual: 244_600, target: 360_000, previous: 251_800 },
  { id: 'exec-15', name: 'Fábio G.', actual: 187_450, target: 300_000, previous: null },
  { id: 'exec-16', name: 'Joana K.', actual: 96_200, target: 280_000, previous: 132_500 },
];

/** Trimestre comparado: o anterior ao da meta. */
export const previousQuarter: QuarterRange = { start: '2026-04', end: '2026-06' };
