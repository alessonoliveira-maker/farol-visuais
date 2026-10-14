/**
 * Oportunidades comerciais do trimestre por etapa do funil, em contagem de oportunidades.
 * Dado fictício e fixo: nenhuma etapa, motivo de perda ou oportunidade corresponde a caso real.
 * Nós 0 a 4 formam o caminho principal, na ordem Aberta, Diagnóstico, Proposta, Negociação, Ganha.
 * Os demais nós são terminais (sem ligação de saída): perda por motivo (sem perfil, timing,
 * concorrência) ou "Em andamento", um conjunto de quatro logo depois de cada etapa de origem,
 * fechando a conservação: o que sai da etapa mais o que fica em andamento soma o total dela.
 */
export interface StageFlowNode {
  readonly name: string;
  /** Papel do nó: avança no caminho principal, perde por motivo, ou segue em andamento. */
  readonly role: 'path' | 'loss' | 'ongoing';
}

export interface StageFlowLink {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

export interface StageFlowData {
  readonly nodes: readonly StageFlowNode[];
  readonly links: readonly StageFlowLink[];
}

export const data: StageFlowData = {
  nodes: [
    { name: 'Aberta', role: 'path' },
    { name: 'Diagnóstico', role: 'path' },
    { name: 'Proposta', role: 'path' },
    { name: 'Negociação', role: 'path' },
    { name: 'Ganha', role: 'path' },
    { name: 'Perdida: sem perfil', role: 'loss' },
    { name: 'Perdida: timing', role: 'loss' },
    { name: 'Perdida: concorrência', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
    { name: 'Perdida: sem perfil', role: 'loss' },
    { name: 'Perdida: timing', role: 'loss' },
    { name: 'Perdida: concorrência', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
    { name: 'Perdida: sem perfil', role: 'loss' },
    { name: 'Perdida: timing', role: 'loss' },
    { name: 'Perdida: concorrência', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
    { name: 'Perdida: sem perfil', role: 'loss' },
    { name: 'Perdida: timing', role: 'loss' },
    { name: 'Perdida: concorrência', role: 'loss' },
    { name: 'Em andamento', role: 'ongoing' },
  ],
  links: [
    { source: 0, target: 1, value: 268 },
    { source: 0, target: 5, value: 58 },
    { source: 0, target: 6, value: 39 },
    { source: 0, target: 7, value: 20 },
    { source: 0, target: 8, value: 35 },
    { source: 1, target: 2, value: 131 },
    { source: 1, target: 9, value: 40 },
    { source: 1, target: 10, value: 35 },
    { source: 1, target: 11, value: 18 },
    { source: 1, target: 12, value: 44 },
    { source: 2, target: 3, value: 64 },
    { source: 2, target: 13, value: 12 },
    { source: 2, target: 14, value: 15 },
    { source: 2, target: 15, value: 22 },
    { source: 2, target: 16, value: 18 },
    { source: 3, target: 4, value: 29 },
    { source: 3, target: 17, value: 3 },
    { source: 3, target: 18, value: 8 },
    { source: 3, target: 19, value: 14 },
    { source: 3, target: 20, value: 10 },
  ],
};
