/**
 * Receita acumulada projetada para 2027, em reais, por mês, em quatro cenários discretos do
 * modelo de planejamento comercial: pessimista, conservador, moderado e otimista. Os quatro
 * são trajetórias fixas do modelo, não percentis nem intervalo de confiança; a faixa ampla vai
 * de pessimista a otimista, a faixa restrita, por cima, vai de conservador a moderado.
 * Dado fictício e fixo.
 */
export interface RevenueScenarioMonth {
  readonly month: string;
  readonly pessimista: number;
  readonly conservador: number;
  readonly moderado: number;
  readonly otimista: number;
}

/** Meta anual fictícia de receita nova, em reais. */
export const target = 10_000_000;

export const data: readonly RevenueScenarioMonth[] = [
  { month: '2027-01', pessimista: 400_000, conservador: 520_000, moderado: 627_000, otimista: 767_000 },
  { month: '2027-02', pessimista: 850_000, conservador: 1_110_000, moderado: 1_332_000, otimista: 1_629_000 },
  { month: '2027-03', pessimista: 1_300_000, conservador: 1_690_000, moderado: 2_037_000, otimista: 2_492_000 },
  { month: '2027-04', pessimista: 1_750_000, conservador: 2_280_000, moderado: 2_742_000, otimista: 3_354_000 },
  { month: '2027-05', pessimista: 2_200_000, conservador: 2_860_000, moderado: 3_447_000, otimista: 4_217_000 },
  { month: '2027-06', pessimista: 2_700_000, conservador: 3_510_000, moderado: 4_230_000, otimista: 5_175_000 },
  { month: '2027-07', pessimista: 3_200_000, conservador: 4_160_000, moderado: 5_013_000, otimista: 6_133_000 },
  { month: '2027-08', pessimista: 3_750_000, conservador: 4_880_000, moderado: 5_876_000, otimista: 7_188_000 },
  { month: '2027-09', pessimista: 4_300_000, conservador: 5_590_000, moderado: 6_740_000, otimista: 8_242_000 },
  { month: '2027-10', pessimista: 4_900_000, conservador: 6_370_000, moderado: 7_677_000, otimista: 9_388_000 },
  { month: '2027-11', pessimista: 5_450_000, conservador: 7_090_000, moderado: 8_541_000, otimista: 10_446_000 },
  { month: '2027-12', pessimista: 6_000_000, conservador: 7_800_000, moderado: 9_400_000, otimista: 11_500_000 },
];
