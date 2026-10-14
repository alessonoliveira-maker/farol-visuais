/**
 * Leads de marketing do mês por origem declarada e desfecho de qualificação, em contagem de
 * pessoas. Dado fictício e fixo: nenhuma origem é marca real e nenhum lead é pessoa real.
 *
 * O nó de índice 5 é a AUSÊNCIA de origem, e ele é um nó de primeira classe: os 174 leads que
 * chegaram sem origem registrada continuam no diagrama, com desfecho e tudo, em vez de sair da
 * conta. Ele vem por último na coluna para o componente poder fixá lo na base com sort={false}.
 * Os nós de índice 0 a 4 são as origens declaradas; os de 6 a 9 são os desfechos.
 *
 * A soma fecha nas duas pontas, e num sankey isso é a própria honestidade do desenho, porque a
 * largura da faixa É o valor. Saídas: 300, 268, 230, 148, 90 e 174, que somam 1.210. Entradas:
 * 325, 253, 412 e 220, que somam os mesmos 1.210. Cobertura: 1.036 de 1.210, ou 86%.
 */
export type NodeKind = 'origin' | 'absence' | 'outcome';

export interface FlowNode {
  readonly name: string;
  readonly kind: NodeKind;
  /** Slot categórico da COR-8, fixo por categoria. Só as origens declaradas têm cor. */
  readonly slot?: number;
}

export interface FlowLink {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

export interface CoverageFlowData {
  readonly nodes: readonly FlowNode[];
  readonly links: readonly FlowLink[];
}

export const data: CoverageFlowData = {
  nodes: [
    { name: 'Mídia social', kind: 'origin', slot: 1 },
    { name: 'Busca paga', kind: 'origin', slot: 3 },
    { name: 'Rede profissional', kind: 'origin', slot: 6 },
    { name: 'Orgânico', kind: 'origin', slot: 5 },
    { name: 'Evento', kind: 'origin', slot: 2 },
    { name: 'Sem origem registrada', kind: 'absence' },
    { name: 'Qualificado', kind: 'outcome' },
    { name: 'Em nutrição', kind: 'outcome' },
    { name: 'Descartado', kind: 'outcome' },
    { name: 'Sem contato', kind: 'outcome' },
  ],
  links: [
    { source: 0, target: 6, value: 60 },
    { source: 0, target: 7, value: 55 },
    { source: 0, target: 8, value: 130 },
    { source: 0, target: 9, value: 55 },
    { source: 1, target: 6, value: 95 },
    { source: 1, target: 7, value: 48 },
    { source: 1, target: 8, value: 80 },
    { source: 1, target: 9, value: 45 },
    { source: 2, target: 6, value: 80 },
    { source: 2, target: 7, value: 60 },
    { source: 2, target: 8, value: 45 },
    { source: 2, target: 9, value: 45 },
    { source: 3, target: 6, value: 45 },
    { source: 3, target: 7, value: 45 },
    { source: 3, target: 8, value: 58 },
    { source: 4, target: 6, value: 45 },
    { source: 4, target: 8, value: 45 },
    { source: 5, target: 7, value: 45 },
    { source: 5, target: 8, value: 54 },
    { source: 5, target: 9, value: 75 },
  ],
};
