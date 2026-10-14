/**
 * Oportunidades comerciais do trimestre por etapa do funil, em contagem de oportunidades, com as
 * duas ligações que um Sankey acíclico não desenha: a que VOLTA uma etapa e a que fecha laço na
 * PRÓPRIA etapa. Dado fictício e fixo: nenhuma etapa, oportunidade ou contagem é caso real.
 *
 * O dado declara as três espécies de ligação juntas, de propósito: separá-las é trabalho do
 * componente, por busca em profundidade, e é justamente isso que a versão demonstra. As bibliotecas
 * de referência tratam o ciclo de dois jeitos, e nenhum deles serve aqui: o nivo avisa que
 * dependência cíclica quebra o gráfico, e o AG Charts remove a ligação que fecha laço sem dizer.
 *
 * As três espécies, e como se reconhecem:
 *   para a frente  `source` e `target` diferentes, e o alvo não está na pilha da busca
 *   retorno        o alvo está na pilha da busca, ou seja a ligação fecha ciclo: 4 volta para 1
 *   laço           `source` igual a `target`: 4 para 4
 *
 * CONSERVAÇÃO, e ela vale só para as ligações para a frente, que são as que o Sankey desenha:
 *   Aberta       268 +  117 +  35   = 420 que entram
 *   Diagnóstico  131 +   93 +  44   = 268
 *   Proposta      64 +   49 +  18   = 131
 *   Negociação    29 +   21 +  14   =  64
 * O Sankey do Recharts toma o valor do nó como o maior entre entradas e saídas e não reclama de nó
 * desequilibrado (armadilha REC-33), então a conta fecha aqui, no dado.
 *
 * O QUE O TOTAL CONTA: 420 oportunidades DISTINTAS. As 12 reaberturas e as 9 propostas refeitas são
 * passagens a mais pelas mesmas oportunidades, então somá-las ao total daria 441 passagens, que é
 * outra unidade. A legenda do desenho declara isso.
 */
export interface ReopenNode {
  readonly name: string;
  /** Papel do nó: avança no caminho principal, perde, ou segue em andamento. */
  readonly role: 'path' | 'loss' | 'ongoing';
}

export interface ReopenLink {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

export interface ReopenData {
  readonly nodes: readonly ReopenNode[];
  readonly links: readonly ReopenLink[];
}

export const data: ReopenData = {
  nodes: [
    { name: 'Aberta', role: 'path' },
    { name: 'Diagnóstico', role: 'path' },
    { name: 'Perdida', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
    { name: 'Proposta', role: 'path' },
    { name: 'Perdida', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
    { name: 'Negociação', role: 'path' },
    { name: 'Perdida', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
    { name: 'Ganha', role: 'path' },
    { name: 'Perdida', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
  ],
  links: [
    { source: 0, target: 1, value: 268 },
    { source: 0, target: 2, value: 117 },
    { source: 0, target: 3, value: 35 },
    { source: 1, target: 4, value: 131 },
    { source: 1, target: 5, value: 93 },
    { source: 1, target: 6, value: 44 },
    { source: 4, target: 7, value: 64 },
    { source: 4, target: 8, value: 49 },
    { source: 4, target: 9, value: 18 },
    { source: 4, target: 1, value: 12 },
    { source: 4, target: 4, value: 9 },
    { source: 7, target: 10, value: 29 },
    { source: 7, target: 11, value: 21 },
    { source: 7, target: 12, value: 14 },
  ],
};
