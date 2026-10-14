/**
 * Repasses de agenda da pré-vendas para vendas num trimestre, em contagem de repasses por par de
 * SDR e executivo. Dado fictício e fixo: nenhum nó é pessoa real, os nomes são posições do time.
 * A ordem dos nós aqui é a de cadastro, de propósito: quem ordena as duas colunas é o baricentro
 * do componente. Par sem linha em `links` é par com zero repasse medido no período, e é assim
 * que o componente o escreve. Os ids não se repetem entre as duas colunas.
 */
export interface GraphNode {
  readonly id: string;
  /** Nome do nó como rótulo, com a inicial maiúscula. */
  readonly label: string;
  /** O mesmo nome no meio de uma oração, com artigo e sem a maiúscula de rótulo. */
  readonly inSentence: string;
}

export interface GraphColumn {
  /** Tipo de entidade no plural, para a frase acessível: "SDRs", "executivos". */
  readonly plural: string;
  readonly nodes: readonly GraphNode[];
}

export interface GraphLink {
  readonly source: string;
  readonly target: string;
  /** Quantas agendas o SDR repassou ao executivo no período. Inteiro maior que zero. */
  readonly weight: number;
}

export interface HandoffGraph {
  /** Período do recorte, já no texto de tela. */
  readonly period: string;
  readonly sources: GraphColumn;
  readonly targets: GraphColumn;
  readonly links: readonly GraphLink[];
}

export const data: HandoffGraph = {
  period: '3º trimestre de 2026',
  sources: {
    plural: 'SDRs',
    nodes: [
      { id: 'sdr-1', label: 'SDR 1', inSentence: 'o SDR 1' },
      { id: 'sdr-2', label: 'SDR 2', inSentence: 'o SDR 2' },
      { id: 'sdr-3', label: 'SDR 3', inSentence: 'o SDR 3' },
      { id: 'sdr-4', label: 'SDR 4', inSentence: 'o SDR 4' },
      { id: 'sdr-5', label: 'SDR 5', inSentence: 'o SDR 5' },
    ],
  },
  targets: {
    plural: 'executivos',
    nodes: [
      { id: 'exec-a', label: 'Executivo A', inSentence: 'o executivo A' },
      { id: 'exec-b', label: 'Executivo B', inSentence: 'o executivo B' },
      { id: 'exec-c', label: 'Executivo C', inSentence: 'o executivo C' },
      { id: 'exec-d', label: 'Executivo D', inSentence: 'o executivo D' },
      { id: 'exec-e', label: 'Executivo E', inSentence: 'o executivo E' },
      { id: 'exec-f', label: 'Executivo F', inSentence: 'o executivo F' },
      { id: 'exec-g', label: 'Executivo G', inSentence: 'o executivo G' },
      { id: 'exec-h', label: 'Executivo H', inSentence: 'o executivo H' },
    ],
  },
  links: [
    { source: 'sdr-1', target: 'exec-a', weight: 7 },
    { source: 'sdr-1', target: 'exec-b', weight: 9 },
    { source: 'sdr-1', target: 'exec-d', weight: 6 },
    { source: 'sdr-1', target: 'exec-g', weight: 11 },
    { source: 'sdr-2', target: 'exec-a', weight: 2 },
    { source: 'sdr-2', target: 'exec-c', weight: 8 },
    { source: 'sdr-2', target: 'exec-d', weight: 9 },
    { source: 'sdr-2', target: 'exec-f', weight: 3 },
    { source: 'sdr-2', target: 'exec-h', weight: 12 },
    { source: 'sdr-3', target: 'exec-a', weight: 4 },
    { source: 'sdr-3', target: 'exec-b', weight: 12 },
    { source: 'sdr-3', target: 'exec-e', weight: 16 },
    { source: 'sdr-3', target: 'exec-g', weight: 8 },
    { source: 'sdr-4', target: 'exec-a', weight: 13 },
    { source: 'sdr-4', target: 'exec-d', weight: 10 },
    { source: 'sdr-4', target: 'exec-g', weight: 8 },
    { source: 'sdr-4', target: 'exec-h', weight: 5 },
    { source: 'sdr-5', target: 'exec-a', weight: 1 },
    { source: 'sdr-5', target: 'exec-c', weight: 14 },
    { source: 'sdr-5', target: 'exec-d', weight: 2 },
    { source: 'sdr-5', target: 'exec-f', weight: 11 },
    { source: 'sdr-5', target: 'exec-h', weight: 6 },
  ],
};

/** O nó aceso por padrão: o SDR cujos repasses a página quer seguir. */
export const highlightId = 'sdr-3';
