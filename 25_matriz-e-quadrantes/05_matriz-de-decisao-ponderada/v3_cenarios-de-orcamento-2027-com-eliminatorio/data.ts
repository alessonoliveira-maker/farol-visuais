/**
 * Quatro cenários fictícios de orçamento de 2027 da diretoria comercial, avaliados em sete
 * critérios e um requisito eliminatório. `gate` é o requisito em passa e não passa, avaliado
 * antes de qualquer soma: o cenário cuja `demand` (leads por mês que pré-vendas precisa
 * atender) passa de `limit` (capacidade medida) sai do ranking. Cada critério declara a
 * procedência (`provenance`), o tipo (`kind`) e a direção que é melhor (`better`).
 * Em critério de medida, o valor do cenário é a medida real (reais, meses ou fração); em
 * critério de receita é uma faixa; em critério de julgamento é a nota ordinal de 1 a 5.
 * `null` é valor ausente, nunca zero. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export type Provenance = 'MEDIDO' | 'PREMISSA' | 'DERIVADO';
export type CriterionKind = 'range' | 'measure' | 'judgment';
export type MeasureUnit = 'currency' | 'months' | 'percent';
export type CellValue = number | null | { readonly low: number; readonly high: number };

export interface Criterion {
  readonly id: string;
  readonly name: string;
  readonly weight: number;
  readonly provenance: Provenance;
  readonly kind: CriterionKind;
  readonly better: 'higher' | 'lower';
  readonly unit: MeasureUnit | null;
}

export interface Gate {
  readonly name: string;
  readonly limit: number;
  readonly provenance: Provenance;
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly demand: number | null;
  /** Um valor por critério, na mesma ordem de `criteria`. */
  readonly values: readonly CellValue[];
}

export interface DecisionMatrix {
  readonly scaleMax: number;
  readonly gate: Gate;
  readonly criteria: readonly Criterion[];
  readonly scenarios: readonly Scenario[];
}

export const data: DecisionMatrix = {
  scaleMax: 5,
  gate: { name: 'Cabe em pré-vendas', limit: 4_800, provenance: 'MEDIDO' },
  criteria: [
    { id: 'receita', name: 'Receita esperada', weight: 30, provenance: 'DERIVADO', kind: 'range', better: 'higher', unit: 'currency' },
    { id: 'custo', name: 'Custo do plano', weight: 20, provenance: 'PREMISSA', kind: 'measure', better: 'lower', unit: 'currency' },
    { id: 'retorno', name: 'Meses até o retorno', weight: 15, provenance: 'DERIVADO', kind: 'measure', better: 'lower', unit: 'months' },
    { id: 'conversao', name: 'Conversão do funil', weight: 10, provenance: 'MEDIDO', kind: 'measure', better: 'higher', unit: 'percent' },
    { id: 'execucao', name: 'Execução segura', weight: 10, provenance: 'PREMISSA', kind: 'judgment', better: 'higher', unit: null },
    { id: 'estrategia', name: 'Aderência à estratégia', weight: 10, provenance: 'PREMISSA', kind: 'judgment', better: 'higher', unit: null },
    { id: 'retencao', name: 'Impacto na retenção', weight: 5, provenance: 'PREMISSA', kind: 'judgment', better: 'higher', unit: null },
  ],
  scenarios: [
    {
      id: 'base-contida',
      name: 'Base contida',
      demand: 3_900,
      values: [{ low: 7_400_000, high: 8_600_000 }, 3_600_000, 16, 0.118, 4, 2, 3],
    },
    {
      id: 'equilibrado',
      name: 'Equilibrado',
      demand: 4_600,
      values: [{ low: 8_200_000, high: 9_800_000 }, 4_400_000, 14, 0.124, 3, 4, 4],
    },
    {
      id: 'expansao',
      name: 'Expansão',
      demand: 6_100,
      values: [{ low: 10_400_000, high: 13_200_000 }, 5_200_000, 15, 0.127, 2, 5, 3],
    },
    {
      id: 'digital-primeiro',
      name: 'Digital primeiro',
      demand: 4_200,
      values: [{ low: 7_800_000, high: 10_600_000 }, 6_000_000, 12, 0.131, 3, 4, 2],
    },
  ],
};
