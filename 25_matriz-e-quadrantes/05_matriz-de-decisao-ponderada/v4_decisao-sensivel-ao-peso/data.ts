/**
 * Quatro cenários fictícios de orçamento de 2027 avaliados em cinco critérios, com nota ordinal
 * de 1 a 5 (5 é o melhor: em custo, 5 é o mais barato). `weight` é o peso em pontos e a soma é
 * normalizada no componente. `short` é o nome do critério dentro de frase. `null` é nota ausente
 * (o cenário não foi avaliado naquele critério) e nunca vale zero: o total sai marcado como
 * incompleto e usa só os pesos das notas presentes.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 */
export interface Criterion {
  readonly id: string;
  readonly name: string;
  readonly short: string;
  readonly weight: number;
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  /** Uma nota por critério, na mesma ordem de `criteria`. */
  readonly scores: readonly (number | null)[];
}

export interface DecisionMatrix {
  readonly scaleMax: number;
  /** Variação aplicada a cada peso na prova de sensibilidade, como fração (0,2 é 20%). */
  readonly weightShift: number;
  readonly criteria: readonly Criterion[];
  readonly scenarios: readonly Scenario[];
}

export const data: DecisionMatrix = {
  scaleMax: 5,
  weightShift: 0.2,
  criteria: [
    { id: 'custo', name: 'Custo do plano', short: 'custo', weight: 30 },
    { id: 'receita', name: 'Receita esperada', short: 'receita', weight: 25 },
    { id: 'prazo', name: 'Prazo de retorno', short: 'prazo de retorno', weight: 20 },
    { id: 'execucao', name: 'Segurança de execução', short: 'segurança de execução', weight: 15 },
    { id: 'retencao', name: 'Impacto na retenção', short: 'retenção', weight: 10 },
  ],
  scenarios: [
    { id: 'equilibrado', name: 'Equilibrado', scores: [3, 4, 4, 4, 4] },
    { id: 'enxuto', name: 'Enxuto', scores: [5, 3, 3, 3, 3] },
    { id: 'expansao', name: 'Expansão', scores: [2, 5, 3, 2, 3] },
    { id: 'digital-primeiro', name: 'Digital primeiro', scores: [4, 3, 2, null, 2] },
  ],
};
