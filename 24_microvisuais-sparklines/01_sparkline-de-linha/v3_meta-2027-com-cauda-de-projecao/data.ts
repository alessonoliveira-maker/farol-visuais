/**
 * Receita mensal de seis linhas de receita: realizado de jan/26 a set/26 (9 meses) e meta mensal
 * para dez/27. A projeção natural é uma reta do último realizado até `projectedEnd`, e a faixa de
 * cenário abre de zero até `lowSpread` e `highSpread` (fração do valor projetado) em dez/27.
 * Casos difíceis: uma linha volátil cujo cenário alto estoura o recorte, uma que cai, e uma cuja
 * projeção empata exatamente com a meta. Valores em reais. Dado fictício e fixo.
 */
export interface RevenueLine {
  readonly id: string;
  readonly name: string;
  /** Receita realizada por mês, de `startMonth` em diante, em reais. */
  readonly actual: readonly number[];
  /** Projeção natural para dez/27, em reais. */
  readonly projectedEnd: number;
  /** Meta mensal de dez/27, em reais. */
  readonly goal: number;
  /** Abertura do cenário baixo em dez/27, como fração da projeção. */
  readonly lowSpread: number;
  /** Abertura do cenário alto em dez/27, como fração da projeção. */
  readonly highSpread: number;
}

export interface GoalProjection {
  /** Primeiro mês do realizado, YYYY-MM. */
  readonly startMonth: string;
  /** Último mês da projeção e mês da meta, YYYY-MM. */
  readonly endMonth: string;
  readonly lines: readonly RevenueLine[];
}

export const data: GoalProjection = {
  startMonth: '2026-01',
  endMonth: '2027-12',
  lines: [
    {
      id: 'assessoria',
      name: 'Assessoria recorrente',
      actual: [410_000, 418_000, 425_000, 431_000, 440_000, 446_000, 452_000, 459_000, 466_000],
      projectedEnd: 538_000,
      goal: 560_000,
      lowSpread: 0.05,
      highSpread: 0.07,
    },
    {
      id: 'credito',
      name: 'Crédito estruturado',
      actual: [210_000, 260_000, 190_000, 300_000, 240_000, 330_000, 280_000, 350_000, 310_000],
      projectedEnd: 420_000,
      goal: 400_000,
      lowSpread: 0.12,
      highSpread: 0.45,
    },
    {
      id: 'consultoria',
      name: 'Consultoria avulsa',
      actual: [180_000, 176_000, 171_000, 169_000, 162_000, 158_000, 151_000, 149_000, 143_000],
      projectedEnd: 120_000,
      goal: 190_000,
      lowSpread: 0.1,
      highSpread: 0.14,
    },
    {
      id: 'corporativo',
      name: 'Planos corporativos',
      actual: [90_000, 98_000, 107_000, 118_000, 126_000, 139_000, 151_000, 160_000, 174_000],
      projectedEnd: 280_000,
      goal: 270_000,
      lowSpread: 0.08,
      highSpread: 0.12,
    },
    {
      id: 'implantacao',
      name: 'Serviços de implantação',
      actual: [120_000, 95_000, 130_000, 110_000, 140_000, 105_000, 150_000, 115_000, 155_000],
      projectedEnd: 160_000,
      goal: 190_000,
      lowSpread: 0.15,
      highSpread: 0.2,
    },
    {
      id: 'renovacoes',
      name: 'Renovações de licença',
      actual: [305_000, 307_000, 304_000, 306_000, 308_000, 305_000, 307_000, 306_000, 308_000],
      projectedEnd: 310_000,
      goal: 310_000,
      lowSpread: 0.03,
      highSpread: 0.04,
    },
  ],
};
