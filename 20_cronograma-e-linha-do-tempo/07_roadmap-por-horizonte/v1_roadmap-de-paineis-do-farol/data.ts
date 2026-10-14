/**
 * Roadmap dos painéis do Farol em três horizontes, sem data comprometida. Cada painel traz o
 * horizonte, o público e a prioridade declarada dentro do horizonte (1 é o primeiro). A lista
 * vem fora de ordem de propósito: quem ordena é o componente, pela prioridade. Dado fictício e fixo.
 */
export type HorizonId = 'agora' | 'proximo' | 'depois';
export type Audience = 'Comercial' | 'Pré-vendas' | 'Marketing' | 'Diretoria';

export interface Horizon {
  readonly id: HorizonId;
  readonly label: string;
}

export interface PanelInitiative {
  readonly id: string;
  readonly title: string;
  readonly audience: Audience;
  readonly horizon: HorizonId;
  readonly priority: number;
}

export interface PanelRoadmap {
  readonly horizons: readonly Horizon[];
  readonly initiatives: readonly PanelInitiative[];
}

export const data: PanelRoadmap = {
  horizons: [
    { id: 'agora', label: 'Agora' },
    { id: 'proximo', label: 'Próximo' },
    { id: 'depois', label: 'Depois' },
  ],
  initiatives: [
    { id: 'pn-07', title: 'Previsão de fechamentos', audience: 'Diretoria', horizon: 'depois', priority: 1 },
    { id: 'pn-03', title: 'Receita nova por executivo', audience: 'Comercial', horizon: 'agora', priority: 3 },
    { id: 'pn-05', title: 'Conversão por canal de origem', audience: 'Marketing', horizon: 'proximo', priority: 2 },
    { id: 'pn-01', title: 'Funil de oportunidades', audience: 'Comercial', horizon: 'agora', priority: 1 },
    { id: 'pn-11', title: 'Atribuição de campanhas', audience: 'Marketing', horizon: 'depois', priority: 3 },
    { id: 'pn-04', title: 'Custo por lead qualificado', audience: 'Marketing', horizon: 'agora', priority: 4 },
    { id: 'pn-06', title: 'Tempo de resposta ao lead', audience: 'Pré-vendas', horizon: 'proximo', priority: 3 },
    { id: 'pn-02', title: 'Handoff de pré-vendas', audience: 'Pré-vendas', horizon: 'agora', priority: 2 },
    { id: 'pn-12', title: 'Capacidade de pré-vendas', audience: 'Pré-vendas', horizon: 'depois', priority: 4 },
    { id: 'pn-08', title: 'Metas do trimestre', audience: 'Diretoria', horizon: 'proximo', priority: 1 },
    { id: 'pn-09', title: 'Carteira em risco', audience: 'Comercial', horizon: 'proximo', priority: 4 },
    { id: 'pn-10', title: 'Retenção de clientes', audience: 'Comercial', horizon: 'depois', priority: 2 },
  ],
};
