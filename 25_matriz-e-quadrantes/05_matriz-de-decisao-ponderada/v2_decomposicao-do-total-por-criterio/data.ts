/**
 * Quatro desenhos fictícios de remuneração variável do time Comercial, avaliados em cinco
 * critérios. `weight` é o peso em pontos (a soma é normalizada no componente) e `slot` é o
 * slot de cor do critério, fixo por critério: o mesmo no cabeçalho e no segmento da barra.
 * Cada nota é ordinal de 1 a 5, na ordem dos critérios; `null` é critério sem nota.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plano real.
 */
export interface Criterion {
  readonly id: string;
  readonly name: string;
  readonly weight: number;
  /** Slot categórico de `--chart-N`, atribuído na ordem da COR-8. */
  readonly slot: 1 | 2 | 3 | 5 | 6;
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
    { id: 'aderencia', name: 'Aderência à meta', weight: 30, slot: 1 },
    { id: 'custo', name: 'Custo previsível', weight: 25, slot: 3 },
    { id: 'apuracao', name: 'Apuração simples', weight: 20, slot: 6 },
    { id: 'retencao', name: 'Retenção do time', weight: 15, slot: 5 },
    { id: 'justica', name: 'Justiça interna', weight: 10, slot: 2 },
  ],
  options: [
    { id: 'comissao-pura', name: 'Comissão pura sobre receita', scores: [5, 2, 2, 3, 3] },
    { id: 'escalonada', name: 'Comissão escalonada', scores: [4, 3, 2, 4, 4] },
    { id: 'fixo-alto', name: 'Fixo alto com premiação trimestral', scores: [3, 5, 3, 2, 2] },
    { id: 'equipe', name: 'Meta de equipe com bônus', scores: [4, 3, 5, 4, 3] },
  ],
};
