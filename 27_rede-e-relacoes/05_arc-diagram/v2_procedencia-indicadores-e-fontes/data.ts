/**
 * Procedência dos indicadores de quatro dashboards: de quais fontes de dado cada indicador
 * depende. A relação é de presença (depende ou não depende), sem peso, e a unidade das contagens
 * é indicadores. Dado fictício e fixo: nenhum dashboard, indicador ou fonte é sistema, produto ou
 * empresa real. Os indicadores vêm na ordem em que aparecem em cada dashboard, e as fontes na
 * ordem de cadastro: quem ordena as fontes no eixo é o componente. Todo indicador tem ao menos
 * uma fonte; sete dependem de duas, que é o caso que cruza os blocos.
 */
export interface DashboardGroup {
  readonly id: string;
  /** Nome do dashboard como rótulo. */
  readonly label: string;
  /** O mesmo dashboard no meio de uma oração, com a preposição: "no comercial". */
  readonly inSentence: string;
}

export interface IndicatorNode {
  readonly id: string;
  readonly label: string;
  /** Id do dashboard em `groups`. */
  readonly groupId: string;
  /** Ids das fontes de que o indicador depende. */
  readonly sources: readonly string[];
}

export interface SourceNode {
  readonly id: string;
  /** Nome da fonte como rótulo. */
  readonly label: string;
  /** A mesma fonte no meio de uma oração, com artigo: "o CRM de vendas". */
  readonly inSentence: string;
}

export interface ProvenanceMap {
  readonly groups: readonly DashboardGroup[];
  readonly indicators: readonly IndicatorNode[];
  readonly sources: readonly SourceNode[];
}

export const data: ProvenanceMap = {
  groups: [
    { id: 'comercial', label: 'Comercial', inSentence: 'no comercial' },
    { id: 'pre-vendas', label: 'Pré-vendas', inSentence: 'na pré-vendas' },
    { id: 'marketing', label: 'Marketing', inSentence: 'no marketing' },
    { id: 'diretoria', label: 'Diretoria', inSentence: 'na diretoria' },
  ],
  indicators: [
    { id: 'receita-nova', label: 'Receita nova', groupId: 'comercial', sources: ['crm'] },
    { id: 'ticket-medio', label: 'Ticket médio', groupId: 'comercial', sources: ['crm'] },
    { id: 'taxa-conversao', label: 'Taxa de conversão', groupId: 'comercial', sources: ['crm'] },
    { id: 'ciclo-venda', label: 'Ciclo de venda', groupId: 'comercial', sources: ['crm'] },
    { id: 'oportunidades', label: 'Oportunidades abertas', groupId: 'comercial', sources: ['crm'] },
    { id: 'atingimento', label: 'Atingimento de meta', groupId: 'comercial', sources: ['metas', 'financeiro'] },
    { id: 'leads-trabalhados', label: 'Leads trabalhados', groupId: 'pre-vendas', sources: ['atendimento'] },
    { id: 'primeira-resposta', label: 'Tempo de primeira resposta', groupId: 'pre-vendas', sources: ['atendimento'] },
    { id: 'reunioes', label: 'Reuniões agendadas', groupId: 'pre-vendas', sources: ['atendimento', 'crm'] },
    { id: 'comparecimento', label: 'Taxa de comparecimento', groupId: 'pre-vendas', sources: ['atendimento'] },
    { id: 'leads-qualificados', label: 'Leads qualificados', groupId: 'pre-vendas', sources: ['crm', 'site'] },
    { id: 'tentativas', label: 'Tentativas por lead', groupId: 'pre-vendas', sources: ['atendimento'] },
    { id: 'leads-gerados', label: 'Leads gerados', groupId: 'marketing', sources: ['site'] },
    { id: 'custo-lead', label: 'Custo por lead', groupId: 'marketing', sources: ['anuncios', 'site'] },
    { id: 'investimento', label: 'Investimento em mídia', groupId: 'marketing', sources: ['anuncios'] },
    { id: 'taxa-clique', label: 'Taxa de clique', groupId: 'marketing', sources: ['anuncios'] },
    { id: 'visitas', label: 'Visitas ao site', groupId: 'marketing', sources: ['site'] },
    { id: 'leads-origem', label: 'Leads por origem', groupId: 'marketing', sources: ['site'] },
    { id: 'receita-recorrente', label: 'Receita recorrente', groupId: 'diretoria', sources: ['financeiro'] },
    { id: 'margem', label: 'Margem de contribuição', groupId: 'diretoria', sources: ['financeiro'] },
    { id: 'custo-aquisicao', label: 'Custo de aquisição', groupId: 'diretoria', sources: ['anuncios', 'crm'] },
    { id: 'retorno-midia', label: 'Retorno sobre mídia', groupId: 'diretoria', sources: ['anuncios', 'financeiro'] },
    { id: 'previsao', label: 'Previsão de receita', groupId: 'diretoria', sources: ['crm', 'metas'] },
    { id: 'cancelamentos', label: 'Cancelamentos', groupId: 'diretoria', sources: ['financeiro'] },
  ],
  sources: [
    { id: 'crm', label: 'CRM de vendas', inSentence: 'o CRM de vendas' },
    { id: 'atendimento', label: 'Plataforma de atendimento', inSentence: 'a plataforma de atendimento' },
    { id: 'anuncios', label: 'Plataforma de anúncios', inSentence: 'a plataforma de anúncios' },
    { id: 'site', label: 'Site institucional', inSentence: 'o site institucional' },
    { id: 'financeiro', label: 'Sistema financeiro', inSentence: 'o sistema financeiro' },
    { id: 'metas', label: 'Planilha de metas', inSentence: 'a planilha de metas' },
  ],
};

/** A fonte acesa por padrão: a que derruba mais indicadores se parar. */
export const highlightId = 'crm';
