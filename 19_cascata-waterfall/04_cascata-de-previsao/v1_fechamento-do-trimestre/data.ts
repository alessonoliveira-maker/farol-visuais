/**
 * Fechamento projetado da receita do trimestre 2026-T3, em reais, lido em 2026-09-13.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Passos (`kind: 'step'`) são variações que começam onde o anterior terminou; o total
 * (`kind: 'total'`) é ancorado no zero. `basis` diz se o passo já aconteceu ou ainda é projeção.
 * Setembro aparece em dois passos: o que já foi realizado até o corte e o que falta projetar.
 * Fechamento: 612.000 + 598.000 + 214.000 + 420.000 = 1.844.000.
 */
export interface ForecastItem {
  readonly id: string;
  readonly label: string;
  readonly basis: 'realizado' | 'projetado';
  readonly kind: 'step' | 'total';
  readonly value: number;
}

/** Data de corte: tudo até ela é realizado, o resto é projeção. */
export const cutDate = '2026-09-13';

export const data: readonly ForecastItem[] = [
  { id: 'jul', label: 'Julho', basis: 'realizado', kind: 'step', value: 612_000 },
  { id: 'ago', label: 'Agosto', basis: 'realizado', kind: 'step', value: 598_000 },
  { id: 'set-realizado', label: 'Setembro', basis: 'realizado', kind: 'step', value: 214_000 },
  { id: 'set-projetado', label: 'Setembro', basis: 'projetado', kind: 'step', value: 420_000 },
  { id: 'trimestre', label: 'Trimestre', basis: 'projetado', kind: 'total', value: 1_844_000 },
];
