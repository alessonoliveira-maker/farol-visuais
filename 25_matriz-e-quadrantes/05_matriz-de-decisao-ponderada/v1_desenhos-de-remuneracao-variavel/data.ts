/**
 * Três desenhos fictícios de remuneração variável do time Comercial, avaliados em cinco
 * critérios acordados. `weight` é o peso do critério em pontos (a soma é normalizada no
 * componente, então não precisa fechar 100). Cada nota é ordinal de 1 a 5, na mesma ordem
 * dos critérios; `null` é critério sem nota, e nunca vale zero na soma.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plano real.
 */
export interface Criterion {
  readonly id: string;
  readonly name: string;
  readonly weight: number;
}

export interface DesignOption {
  readonly id: string;
  readonly name: string;
  /** Uma nota por critério, na mesma ordem de `criteria`. */
  readonly scores: readonly (number | null)[];
}

export interface DecisionMatrix {
  readonly scaleMax: number;
  readonly criteria: readonly Criterion[];
  readonly options: readonly DesignOption[];
}

export const data: DecisionMatrix = {
  scaleMax: 5,
  criteria: [
    { id: 'aderencia', name: 'Aderência à meta', weight: 30 },
    { id: 'custo', name: 'Custo previsível', weight: 25 },
    { id: 'apuracao', name: 'Apuração simples', weight: 20 },
    { id: 'retencao', name: 'Retenção do time', weight: 15 },
    { id: 'justica', name: 'Justiça interna', weight: 10 },
  ],
  options: [
    { id: 'escalonada', name: 'Comissão escalonada', scores: [5, 2, 3, 3, 4] },
    { id: 'equipe', name: 'Meta de equipe com bônus', scores: [3, 4, 4, 4, 3] },
    { id: 'fixo-alto', name: 'Fixo alto com premiação trimestral', scores: [2, 5, 5, 3, 4] },
  ],
};
