/**
 * Agendas marcadas de pré-vendas no mês por origem e desfecho, em contagem de agendas. Dado
 * fictício e fixo: nenhuma origem é marca real e nenhuma agenda é pessoa real.
 *
 * Os nós de índice 0 a 4 são as origens, desenhadas no TOPO; os de 5 a 8 são os desfechos, na
 * BASE. A ordem do array é a ordem da esquerda para a direita em cada fileira, e é ela que o
 * componente usa para deslocar as faixas dentro do nó.
 *
 * A soma fecha nas duas pontas, e num sankey isso é a própria honestidade do desenho, porque a
 * largura da faixa É o valor. Saídas por origem: 62, 54, 48, 52 e 32, que somam 248. Entradas
 * por desfecho: 187, 29, 18 e 14, que somam os mesmos 248.
 */
export type NodeKind = 'origin' | 'outcome';

export interface FlowNode {
  readonly name: string;
  readonly kind: NodeKind;
  /** Slot categórico da COR-8, fixo por categoria. Só as origens têm cor. */
  readonly slot?: number;
}

export interface FlowLink {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

export interface VerticalFlowData {
  readonly nodes: readonly FlowNode[];
  readonly links: readonly FlowLink[];
}

export const data: VerticalFlowData = {
  nodes: [
    { name: 'Mídia social', kind: 'origin', slot: 1 },
    { name: 'Busca paga', kind: 'origin', slot: 3 },
    { name: 'Indicação', kind: 'origin', slot: 6 },
    { name: 'Prospecção ativa', kind: 'origin', slot: 5 },
    { name: 'Evento', kind: 'origin', slot: 2 },
    { name: 'Realizada', kind: 'outcome' },
    { name: 'Remarcada', kind: 'outcome' },
    { name: 'Cancelada', kind: 'outcome' },
    { name: 'Não compareceu', kind: 'outcome' },
  ],
  links: [
    { source: 0, target: 5, value: 40 },
    { source: 0, target: 6, value: 10 },
    { source: 0, target: 7, value: 6 },
    { source: 0, target: 8, value: 6 },
    { source: 1, target: 5, value: 38 },
    { source: 1, target: 6, value: 8 },
    { source: 1, target: 7, value: 4 },
    { source: 1, target: 8, value: 4 },
    { source: 2, target: 5, value: 44 },
    { source: 2, target: 6, value: 4 },
    { source: 3, target: 5, value: 33 },
    { source: 3, target: 6, value: 7 },
    { source: 3, target: 7, value: 8 },
    { source: 3, target: 8, value: 4 },
    { source: 4, target: 5, value: 32 },
  ],
};
