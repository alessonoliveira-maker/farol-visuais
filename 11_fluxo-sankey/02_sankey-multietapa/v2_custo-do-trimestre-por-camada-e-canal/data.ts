/**
 * Custo de aquisição do trimestre, em reais, repartido de três camadas de custo para cinco canais
 * e daí para dois desfechos de atribuição. Dado fictício e fixo: nenhuma camada, canal ou valor
 * corresponde a caso real, e nenhuma empresa é citada.
 *
 * Uma unidade só no diagrama inteiro: reais de custo do trimestre. Total 1.860.000.
 *
 * A conservação fecha nas três colunas, e isso é requisito do desenho, não zelo: o Sankey do
 * Recharts define o valor do nó como o MAIOR entre a soma das entradas e a soma das saídas, sem
 * exigir que as duas batam, então nó desequilibrado desenha alto demais e reescala o diagrama
 * inteiro em silêncio (armadilha REC-33). Somas conferidas linha a linha:
 *   camadas    410.000 + 620.000 + 830.000                               = 1.860.000
 *   canais     420.000 + 450.000 + 320.000 + 350.000 + 320.000           = 1.860.000
 *   desfechos  870.000 + 990.000                                         = 1.860.000
 *
 * Os valores também foram escolhidos para que o percentual inteiro de cada coluna some 100 por
 * arredondamento simples (NUM-2), sem precisar de repartição por maior resto:
 *   camadas    22 + 33 + 45 = 100 · canais 23 + 24 + 17 + 19 + 17 = 100 · desfechos 47 + 53 = 100
 *
 * A ORDEM DOS DOIS DESFECHOS NÃO É ESTÉTICA: "Sem retorno atribuído" vem primeiro porque os dois
 * canais que terminam nele, Mídia social e Busca paga, são os dois primeiros da coluna do meio.
 * Com o desfecho atribuído em cima, as cinco faixas da segunda etapa se cruzariam no vão, e faixa
 * cruzada em cor única não se acompanha com o olho.
 */
export interface CostFlowNode {
  readonly name: string;
  /**
   * Papel do nó no diagrama: camada de custo na origem, canal no meio, e os dois desfechos de
   * atribuição no fim. A cor e a forma seguem o papel, nunca o índice do array.
   */
  readonly role: 'layer' | 'channel' | 'attributed' | 'unattributed';
  /**
   * Camada de custo escrita no rótulo do nó de origem, para ninguém somar retorno de camadas
   * diferentes sem aviso. Texto pronto no dado, e não um número a formatar na tela. Nulo nos nós
   * que não são origem.
   */
  readonly layerLabel: string | null;
}

export interface CostFlowLink {
  readonly source: number;
  readonly target: number;
  /** Custo em reais do trimestre. */
  readonly value: number;
}

export interface CostFlowData {
  readonly nodes: readonly CostFlowNode[];
  readonly links: readonly CostFlowLink[];
}

export const data: CostFlowData = {
  nodes: [
    { name: 'Mídia', role: 'layer', layerLabel: 'Camada 1' },
    { name: 'Pessoas da esteira', role: 'layer', layerLabel: 'Camada 2' },
    { name: 'Estrutura', role: 'layer', layerLabel: 'Camada 3' },
    { name: 'Mídia social', role: 'channel', layerLabel: null },
    { name: 'Busca paga', role: 'channel', layerLabel: null },
    { name: 'Rede profissional', role: 'channel', layerLabel: null },
    { name: 'Evento', role: 'channel', layerLabel: null },
    { name: 'Indicação', role: 'channel', layerLabel: null },
    { name: 'Sem retorno atribuído', role: 'unattributed', layerLabel: null },
    { name: 'Com ganho atribuído', role: 'attributed', layerLabel: null },
  ],
  links: [
    { source: 0, target: 3, value: 245_000 },
    { source: 0, target: 4, value: 165_000 },
    { source: 1, target: 3, value: 85_000 },
    { source: 1, target: 4, value: 115_000 },
    { source: 1, target: 5, value: 150_000 },
    { source: 1, target: 6, value: 140_000 },
    { source: 1, target: 7, value: 130_000 },
    { source: 2, target: 3, value: 90_000 },
    { source: 2, target: 4, value: 170_000 },
    { source: 2, target: 5, value: 170_000 },
    { source: 2, target: 6, value: 210_000 },
    { source: 2, target: 7, value: 190_000 },
    { source: 3, target: 8, value: 420_000 },
    { source: 4, target: 8, value: 450_000 },
    { source: 5, target: 9, value: 320_000 },
    { source: 6, target: 9, value: 350_000 },
    { source: 7, target: 9, value: 320_000 },
  ],
};
