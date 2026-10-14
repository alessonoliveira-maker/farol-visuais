/**
 * Procedência dos indicadores de quatro dashboards: de quais fontes de dado cada indicador
 * depende. A relação é de presença, sem peso, e a unidade das contagens é indicadores. Dado
 * fictício e fixo: nenhum dashboard, indicador ou fonte é sistema, produto ou empresa real.
 * Duas ausências diferentes moram aqui, e o dado as separa. Três indicadores têm `sources` vazio:
 * ninguém declarou de onde o número vem, então não há o que avaliar. A pesquisa de satisfação é
 * fonte declarada que nenhum indicador usa: foi avaliada e a contagem dela é zero. Os indicadores
 * sem fonte vêm misturados aos outros, na ordem do dashboard: quem os leva para o fim do eixo é
 * o componente.
 */
export interface DashboardGroup {
  readonly id: string;
  /** Nome do dashboard como rótulo. */
  readonly label: string;
}

export interface IndicatorNode {
  readonly id: string;
  readonly label: string;
  /** Id do dashboard em `groups`. */
  readonly groupId: string;
  /** Ids das fontes de que o indicador depende. Lista vazia: fonte não declarada. */
  readonly sources: readonly string[];
}

export interface SourceNode {
  readonly id: string;
  /** Nome da fonte como rótulo. */
  readonly label: string;
  /** A mesma fonte no meio de uma oração, com artigo: "a pesquisa de satisfação". */
  readonly inSentence: string;
}

export interface ProvenanceMap {
  readonly groups: readonly DashboardGroup[];
  readonly indicators: readonly IndicatorNode[];
  readonly sources: readonly SourceNode[];
}

export const data: ProvenanceMap = {
  groups: [
    { id: 'comercial', label: 'Comercial' },
    { id: 'pre-vendas', label: 'Pré-vendas' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'diretoria', label: 'Diretoria' },
  ],
  indicators: [
    { id: 'receita-nova', label: 'Receita nova', groupId: 'comercial', sources: ['crm', 'financeiro'] },
    { id: 'ticket-medio', label: 'Ticket médio', groupId: 'comercial', sources: ['crm'] },
    { id: 'engajamento', label: 'Engajamento do cliente', groupId: 'comercial', sources: [] },
    { id: 'taxa-conversao', label: 'Taxa de conversão', groupId: 'comercial', sources: ['crm'] },
    { id: 'ciclo-venda', label: 'Ciclo de venda', groupId: 'comercial', sources: ['crm'] },
    { id: 'leads-trabalhados', label: 'Leads trabalhados', groupId: 'pre-vendas', sources: ['atendimento'] },
    { id: 'primeira-resposta', label: 'Tempo de primeira resposta', groupId: 'pre-vendas', sources: ['atendimento'] },
    { id: 'reunioes', label: 'Reuniões agendadas', groupId: 'pre-vendas', sources: ['atendimento', 'crm'] },
    { id: 'leads-gerados', label: 'Leads gerados', groupId: 'marketing', sources: ['anuncios'] },
    { id: 'custo-lead', label: 'Custo por lead', groupId: 'marketing', sources: ['anuncios', 'financeiro'] },
    { id: 'saude-carteira', label: 'Saúde da carteira', groupId: 'diretoria', sources: [] },
    { id: 'margem', label: 'Margem de contribuição', groupId: 'diretoria', sources: ['financeiro'] },
    { id: 'previsao', label: 'Previsão de receita', groupId: 'diretoria', sources: ['crm', 'financeiro'] },
    { id: 'potencial-expansao', label: 'Potencial de expansão', groupId: 'diretoria', sources: [] },
  ],
  sources: [
    { id: 'crm', label: 'CRM de vendas', inSentence: 'o CRM de vendas' },
    { id: 'atendimento', label: 'Plataforma de atendimento', inSentence: 'a plataforma de atendimento' },
    { id: 'pesquisa', label: 'Pesquisa de satisfação', inSentence: 'a pesquisa de satisfação' },
    { id: 'anuncios', label: 'Plataforma de anúncios', inSentence: 'a plataforma de anúncios' },
    { id: 'financeiro', label: 'Sistema financeiro', inSentence: 'o sistema financeiro' },
  ],
};
