/**
 * Iniciativas fictícias de quatro públicos distribuídas em três horizontes, sem data
 * comprometida. A que já foi para o Gantt traz `ganttOn`, a data comprometida em
 * `YYYY-MM-DD`; as demais trazem `null`. Dado fixo.
 */
export type HorizonId = 'agora' | 'proximo' | 'depois';
export type Audience = 'Comercial' | 'Pré-vendas' | 'Marketing' | 'Diretoria';

export interface Horizon {
  readonly id: HorizonId;
  readonly label: string;
}

export interface AudienceInitiative {
  readonly id: string;
  readonly title: string;
  readonly audience: Audience;
  readonly horizon: HorizonId;
  readonly priority: number;
  readonly ganttOn: string | null;
}

export interface AudienceRoadmap {
  readonly horizons: readonly Horizon[];
  /** Ordem das faixas, de cima para baixo. */
  readonly audiences: readonly Audience[];
  readonly initiatives: readonly AudienceInitiative[];
}

export const data: AudienceRoadmap = {
  horizons: [
    { id: 'agora', label: 'Agora' },
    { id: 'proximo', label: 'Próximo' },
    { id: 'depois', label: 'Depois' },
  ],
  audiences: ['Comercial', 'Pré-vendas', 'Marketing', 'Diretoria'],
  initiatives: [
    { id: 'c-01', title: 'Funil semanal', audience: 'Comercial', horizon: 'agora', priority: 1, ganttOn: '2026-11-03' },
    { id: 'c-02', title: 'Metas por região', audience: 'Comercial', horizon: 'agora', priority: 2, ganttOn: null },
    { id: 'c-03', title: 'Carteira em risco', audience: 'Comercial', horizon: 'proximo', priority: 1, ganttOn: null },
    { id: 'c-04', title: 'Renovações do ano', audience: 'Comercial', horizon: 'proximo', priority: 2, ganttOn: null },
    { id: 'c-05', title: 'Previsão de receita', audience: 'Comercial', horizon: 'depois', priority: 1, ganttOn: null },
    { id: 'c-06', title: 'Painel de churn', audience: 'Comercial', horizon: 'depois', priority: 2, ganttOn: null },
    { id: 'p-01', title: 'Qualificação', audience: 'Pré-vendas', horizon: 'agora', priority: 1, ganttOn: null },
    { id: 'p-02', title: 'Agenda única', audience: 'Pré-vendas', horizon: 'agora', priority: 2, ganttOn: null },
    { id: 'p-03', title: 'Handoff ao executivo', audience: 'Pré-vendas', horizon: 'agora', priority: 3, ganttOn: null },
    { id: 'p-04', title: 'Roteiro de reunião', audience: 'Pré-vendas', horizon: 'proximo', priority: 1, ganttOn: '2026-12-01' },
    { id: 'p-05', title: 'Pontuação de leads', audience: 'Pré-vendas', horizon: 'proximo', priority: 2, ganttOn: null },
    { id: 'p-06', title: 'Capacidade da fila', audience: 'Pré-vendas', horizon: 'depois', priority: 1, ganttOn: null },
    { id: 'm-01', title: 'Custo por lead', audience: 'Marketing', horizon: 'agora', priority: 1, ganttOn: '2026-10-20' },
    { id: 'm-02', title: 'Conversão por canal', audience: 'Marketing', horizon: 'proximo', priority: 1, ganttOn: null },
    { id: 'm-03', title: 'Atribuição', audience: 'Marketing', horizon: 'proximo', priority: 2, ganttOn: null },
    { id: 'm-04', title: 'Calendário editorial', audience: 'Marketing', horizon: 'proximo', priority: 3, ganttOn: null },
    { id: 'm-05', title: 'Mix de mídia', audience: 'Marketing', horizon: 'depois', priority: 1, ganttOn: null },
    { id: 'm-06', title: 'Pesquisa de marca', audience: 'Marketing', horizon: 'depois', priority: 2, ganttOn: null },
    { id: 'd-01', title: 'Metas do trimestre', audience: 'Diretoria', horizon: 'agora', priority: 1, ganttOn: null },
    { id: 'd-02', title: 'Resumo executivo', audience: 'Diretoria', horizon: 'agora', priority: 2, ganttOn: null },
    { id: 'd-03', title: 'Visão consolidada', audience: 'Diretoria', horizon: 'proximo', priority: 1, ganttOn: '2027-01-12' },
    { id: 'd-04', title: 'Previsão anual', audience: 'Diretoria', horizon: 'depois', priority: 1, ganttOn: null },
    { id: 'd-05', title: 'Cobertura de mercado', audience: 'Diretoria', horizon: 'depois', priority: 2, ganttOn: null },
    { id: 'd-06', title: 'Plano de capacidade', audience: 'Diretoria', horizon: 'depois', priority: 3, ganttOn: null },
  ],
};
