/**
 * Leads de marketing por origem e desfecho de qualificação, em contagem de pessoas.
 * Dado fictício e fixo: nenhuma origem paga é marca real, nenhum lead é pessoa real.
 * Os nós de índice 0 a 4 são origens; os de índice 5 a 8 são desfechos.
 */
export interface FlowNode {
  readonly name: string;
}

export interface FlowLink {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

export interface SankeyFlowData {
  readonly nodes: readonly FlowNode[];
  readonly links: readonly FlowLink[];
}

export const data: SankeyFlowData = {
  nodes: [
    { name: 'Mídia social' },
    { name: 'Busca paga' },
    { name: 'Rede profissional' },
    { name: 'Orgânico' },
    { name: 'Evento' },
    { name: 'Qualificado' },
    { name: 'Em nutrição' },
    { name: 'Descartado' },
    { name: 'Sem contato' },
  ],
  links: [
    { source: 0, target: 5, value: 90 },
    { source: 0, target: 6, value: 70 },
    { source: 0, target: 7, value: 260 },
    { source: 1, target: 5, value: 140 },
    { source: 1, target: 6, value: 70 },
    { source: 1, target: 7, value: 100 },
    { source: 2, target: 5, value: 95 },
    { source: 2, target: 6, value: 90 },
    { source: 2, target: 7, value: 75 },
    { source: 3, target: 5, value: 16 },
    { source: 3, target: 7, value: 84 },
    { source: 3, target: 8, value: 75 },
    { source: 4, target: 7, value: 30 },
    { source: 4, target: 8, value: 45 },
  ],
};
