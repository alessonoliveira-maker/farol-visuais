/**
 * Carteira de 180 contas cruzada por ABC (receita reconhecida em 2026, em reais) e XYZ
 * (previsibilidade mensal da receita). `accounts` é a contagem de contas da célula e `revenue` a soma
 * da receita delas; `null` é célula sem medida, e não zero. Dado fictício e fixo, já agregado.
 */
export type AbcClass = 'A' | 'B' | 'C';
export type XyzClass = 'X' | 'Y' | 'Z';

export interface PortfolioCell {
  readonly abc: AbcClass;
  readonly xyz: XyzClass;
  readonly accounts: number;
  readonly revenue: number | null;
}

/** Critério de cada faixa, escrito no cabeçalho. Cortes fixos de negócio, não quantis. */
export interface ClassCriterion {
  readonly id: AbcClass | XyzClass;
  readonly label: string;
  readonly criterion: string;
}

export const ABC_CRITERIA: readonly ClassCriterion[] = [
  { id: 'A', label: 'A', criterion: 'até 80% da receita' },
  { id: 'B', label: 'B', criterion: 'de 80% a 95%' },
  { id: 'C', label: 'C', criterion: 'os últimos 5%' },
];

export const XYZ_CRITERIA: readonly ClassCriterion[] = [
  { id: 'X', label: 'X', criterion: 'variação até 0,5' },
  { id: 'Y', label: 'Y', criterion: 'de 0,5 a 1,0' },
  { id: 'Z', label: 'Z', criterion: 'acima de 1,0' },
];

export const data: readonly PortfolioCell[] = [
  { abc: 'A', xyz: 'X', accounts: 28, revenue: 4_900_000 },
  { abc: 'A', xyz: 'Y', accounts: 21, revenue: 3_800_000 },
  { abc: 'A', xyz: 'Z', accounts: 9, revenue: 2_500_000 },
  { abc: 'B', xyz: 'X', accounts: 14, revenue: 800_000 },
  { abc: 'B', xyz: 'Y', accounts: 26, revenue: 830_000 },
  { abc: 'B', xyz: 'Z', accounts: 22, revenue: 470_000 },
  { abc: 'C', xyz: 'X', accounts: 5, revenue: 150_000 },
  { abc: 'C', xyz: 'Y', accounts: 19, revenue: 220_000 },
  { abc: 'C', xyz: 'Z', accounts: 36, revenue: 330_000 },
];
