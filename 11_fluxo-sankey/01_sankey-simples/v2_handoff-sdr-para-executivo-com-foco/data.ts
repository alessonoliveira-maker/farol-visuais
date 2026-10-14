/**
 * Agendas realizadas de pré-vendas no mês, no grão de quem marcou (SDR) para quem atendeu
 * (executivo comercial). Unidade: contagem de agendas. Dado fictício e fixo: nenhum SDR e
 * nenhum executivo é pessoa real, e os rótulos são posições genéricas de time.
 *
 * Os nós de índice 0 a 4 são os SDRs; os de 5 a 12 são os executivos. As 40 ligações cobrem
 * todos os pares, de propósito: é isso que produz as ligações fracas que o componente agrega
 * em "Outros executivos" antes de desenhar.
 *
 * A soma fecha nas duas pontas, e isso não é detalhe de arrumação: num sankey a largura da
 * faixa É o valor, então entrada e saída de cada nó precisam fechar por construção. Saídas por
 * SDR: 42, 38, 47, 33 e 27, que somam 187. Entradas por executivo: 35, 44, 29, 24, 21, 19, 8
 * e 7, que somam os mesmos 187.
 */
export interface FlowNode {
  readonly name: string;
}

export interface FlowLink {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

export interface HandoffFlowData {
  readonly nodes: readonly FlowNode[];
  readonly links: readonly FlowLink[];
}

export const data: HandoffFlowData = {
  nodes: [
    { name: 'SDR 1' },
    { name: 'SDR 2' },
    { name: 'SDR 3' },
    { name: 'SDR 4' },
    { name: 'SDR 5' },
    { name: 'Executivo A' },
    { name: 'Executivo B' },
    { name: 'Executivo C' },
    { name: 'Executivo D' },
    { name: 'Executivo E' },
    { name: 'Executivo F' },
    { name: 'Executivo G' },
    { name: 'Executivo H' },
  ],
  links: [
    { source: 0, target: 5, value: 9 },
    { source: 0, target: 6, value: 8 },
    { source: 0, target: 7, value: 7 },
    { source: 0, target: 8, value: 6 },
    { source: 0, target: 9, value: 5 },
    { source: 0, target: 10, value: 4 },
    { source: 0, target: 11, value: 2 },
    { source: 0, target: 12, value: 1 },
    { source: 1, target: 5, value: 7 },
    { source: 1, target: 6, value: 9 },
    { source: 1, target: 7, value: 6 },
    { source: 1, target: 8, value: 5 },
    { source: 1, target: 9, value: 4 },
    { source: 1, target: 10, value: 4 },
    { source: 1, target: 11, value: 2 },
    { source: 1, target: 12, value: 1 },
    { source: 2, target: 5, value: 8 },
    { source: 2, target: 6, value: 14 },
    { source: 2, target: 7, value: 7 },
    { source: 2, target: 8, value: 6 },
    { source: 2, target: 9, value: 5 },
    { source: 2, target: 10, value: 4 },
    { source: 2, target: 11, value: 1 },
    { source: 2, target: 12, value: 2 },
    { source: 3, target: 5, value: 6 },
    { source: 3, target: 6, value: 7 },
    { source: 3, target: 7, value: 5 },
    { source: 3, target: 8, value: 4 },
    { source: 3, target: 9, value: 4 },
    { source: 3, target: 10, value: 4 },
    { source: 3, target: 11, value: 2 },
    { source: 3, target: 12, value: 1 },
    { source: 4, target: 5, value: 5 },
    { source: 4, target: 6, value: 6 },
    { source: 4, target: 7, value: 4 },
    { source: 4, target: 8, value: 3 },
    { source: 4, target: 9, value: 3 },
    { source: 4, target: 10, value: 3 },
    { source: 4, target: 11, value: 1 },
    { source: 4, target: 12, value: 2 },
  ],
};

/** O nó aceso por padrão, pelo nome do nó. Vazio deixa o diagrama inteiro em neutro. */
export const highlightId = 'SDR 3';
