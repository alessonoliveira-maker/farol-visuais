/**
 * Quatro cenários de planejamento de 2027 avaliados em 6 critérios, cada um com faixa de
 * normalização própria (`min`, `max`) declarada pelo autor, não calculada do maior e menor
 * valor da tela. `direction` diz se maior ou menor é melhor; o valor bruto (`value`) é o que
 * aparece escrito ao lado da bola de Harvey. Dado fictício e fixo: nenhum cenário real da
 * empresa é citado.
 */
export type Direction = 'maior_melhor' | 'menor_melhor';
export type CriterionUnit = 'currencyCompact' | 'percent' | 'days' | 'decimal';

export interface Criterion {
  readonly id: string;
  readonly name: string;
  readonly unit: CriterionUnit;
  readonly direction: Direction;
  readonly min: number;
  readonly max: number;
}

export interface ScenarioRow {
  readonly id: string;
  readonly scenario: string;
  readonly values: readonly number[];
}

export const criteria: readonly Criterion[] = [
  { id: 'receita', name: 'Receita projetada', unit: 'currencyCompact', direction: 'maior_melhor', min: 20_000_000, max: 60_000_000 },
  { id: 'margem', name: 'Margem operacional', unit: 'percent', direction: 'maior_melhor', min: 0.05, max: 0.3 },
  { id: 'investimento', name: 'Investimento necessário', unit: 'currencyCompact', direction: 'menor_melhor', min: 1_000_000, max: 8_000_000 },
  { id: 'inadimplencia', name: 'Risco de inadimplência', unit: 'percent', direction: 'menor_melhor', min: 0.02, max: 0.2 },
  { id: 'breakeven', name: 'Tempo até o break even', unit: 'days', direction: 'menor_melhor', min: 90, max: 540 },
  { id: 'satisfacao', name: 'Satisfação do time', unit: 'decimal', direction: 'maior_melhor', min: 5, max: 9 },
];

export const data: readonly ScenarioRow[] = [
  { id: 'conservador', scenario: 'Conservador', values: [28_000_000, 0.14, 2_500_000, 0.05, 180, 8.0] },
  { id: 'base', scenario: 'Base', values: [38_000_000, 0.19, 4_000_000, 0.09, 260, 7.2] },
  { id: 'agressivo', scenario: 'Agressivo', values: [54_000_000, 0.24, 7_200_000, 0.14, 420, 6.2] },
  { id: 'estresse', scenario: 'Estresse', values: [21_000_000, 0.07, 3_000_000, 0.19, 510, 5.6] },
];
