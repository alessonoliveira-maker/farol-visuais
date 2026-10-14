/**
 * Projeção da receita do trimestre 2026-T3 contra o plano, em reais, lida em 2026-09-13.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Passos (`kind: 'step'`) começam onde o anterior terminou; o total (`kind: 'total'`) é ancorado no
 * zero. A distância do plano não é dado: o componente a calcula como total menos plano, para a
 * conta ficar num lugar só. Fechamento: 1.424.000 + 420.000 = 1.844.000; plano 1.950.000.
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

/** Plano do trimestre contra o qual a projeção é lida. */
export const plan = 1_950_000;

/** De onde sai a projeção, em uma frase curta para a anotação. */
export const projectionOrigin = 'oportunidades com fechamento até 30/09';

export const data: readonly ForecastItem[] = [
  { id: 'realizado', label: 'Realizado', basis: 'realizado', kind: 'step', value: 1_424_000 },
  { id: 'projetado', label: 'Projetado', basis: 'projetado', kind: 'step', value: 420_000 },
  { id: 'total', label: 'Total projetado', basis: 'projetado', kind: 'total', value: 1_844_000 },
];
