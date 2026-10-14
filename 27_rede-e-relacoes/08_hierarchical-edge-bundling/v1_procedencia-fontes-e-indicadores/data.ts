/**
 * Procedência fictícia de indicadores: de quais fontes de dado cada indicador de dashboard depende.
 * A hierarquia tem três níveis abaixo da raiz: o ramo (fontes de dado ou indicadores), o grupo (o
 * sistema que guarda a fonte ou o dashboard que mostra o indicador) e a folha. Cada ligação diz que
 * o indicador `to` usa a fonte `from`; ela não tem peso, só existência, e a unidade do que se conta
 * no cartão é a dependência. Dado fictício e fixo: nenhum sistema, dashboard, fonte ou indicador é
 * produto, marca ou empresa real.
 *
 * A ordem é a de cadastro, e é ela que dá a volta do círculo, em sentido anti-horário a partir do
 * topo: as fontes descem pela esquerda e os indicadores sobem pela direita.
 * Casos difíceis: uma fonte que alimenta 11 indicadores de quatro dashboards (formulário do site) ao
 * lado de duas que alimentam um só (cliques em anúncio e impressões de anúncio); empate de alcance
 * entre fontes (quatro com 4 indicadores e quatro com 3); indicadores de uma fonte só; grupos de 3 a
 * 10 folhas; um dashboard que não usa a fonte mais usada (pós-venda); e nomes de 22 caracteres
 * (pesquisa de satisfação, taxa de comparecimento), que são o teto de largura do rótulo.
 */
export interface LineageLeaf {
  readonly id: string;
  /** Nome como rótulo, com a inicial maiúscula. */
  readonly label: string;
  /** O mesmo nome no meio de uma oração, sem a maiúscula de rótulo. */
  readonly inSentence: string;
}

export interface LineageGroup {
  readonly id: string;
  readonly label: string;
  readonly inSentence: string;
  readonly leaves: readonly LineageLeaf[];
}

export interface LineageLink {
  /** `id` da fonte de que o indicador depende. */
  readonly from: string;
  /** `id` do indicador que depende da fonte. */
  readonly to: string;
}

export interface Lineage {
  /** Ramo das fontes de dado, agrupadas pelo sistema que as guarda. */
  readonly sources: readonly LineageGroup[];
  /** Ramo dos indicadores, agrupados pelo dashboard que os mostra. */
  readonly indicators: readonly LineageGroup[];
  readonly links: readonly LineageLink[];
}

const sources: readonly LineageGroup[] = [
  {
    id: 'sis-vendas',
    label: 'Sistema de vendas',
    inSentence: 'sistema de vendas',
    leaves: [
      { id: 'contas', label: 'Cadastro de contas', inSentence: 'cadastro de contas' },
      { id: 'oportunidades', label: 'Oportunidades', inSentence: 'oportunidades' },
      { id: 'atividades', label: 'Atividades de venda', inSentence: 'atividades de venda' },
      { id: 'propostas', label: 'Propostas emitidas', inSentence: 'propostas emitidas' },
    ],
  },
  {
    id: 'sis-site',
    label: 'Site',
    inSentence: 'site',
    leaves: [
      { id: 'formulario', label: 'Formulário do site', inSentence: 'formulário do site' },
      { id: 'sessoes', label: 'Sessões do site', inSentence: 'sessões do site' },
      { id: 'chat', label: 'Chat do site', inSentence: 'chat do site' },
      { id: 'paginas', label: 'Páginas de produto', inSentence: 'páginas de produto' },
    ],
  },
  {
    id: 'sis-midia',
    label: 'Mídia paga',
    inSentence: 'mídia paga',
    leaves: [
      { id: 'investimento', label: 'Investimento em mídia', inSentence: 'investimento em mídia' },
      { id: 'cliques', label: 'Cliques em anúncio', inSentence: 'cliques em anúncio' },
      { id: 'impressoes', label: 'Impressões de anúncio', inSentence: 'impressões de anúncio' },
    ],
  },
  {
    id: 'sis-atendimento',
    label: 'Central de atendimento',
    inSentence: 'central de atendimento',
    leaves: [
      { id: 'chamados', label: 'Chamados abertos', inSentence: 'chamados abertos' },
      { id: 'conversas', label: 'Conversas atendidas', inSentence: 'conversas atendidas' },
      { id: 'pesquisa', label: 'Pesquisa de satisfação', inSentence: 'pesquisa de satisfação' },
    ],
  },
  {
    id: 'sis-financeiro',
    label: 'Sistema financeiro',
    inSentence: 'sistema financeiro',
    leaves: [
      { id: 'faturas', label: 'Faturas emitidas', inSentence: 'faturas emitidas' },
      { id: 'recebimentos', label: 'Recebimentos', inSentence: 'recebimentos' },
      { id: 'contratos', label: 'Contratos ativos', inSentence: 'contratos ativos' },
      { id: 'orcamento', label: 'Orçamento anual', inSentence: 'orçamento anual' },
    ],
  },
];

const indicators: readonly LineageGroup[] = [
  {
    id: 'dash-comercial',
    label: 'Dashboard comercial',
    inSentence: 'dashboard comercial',
    leaves: [
      { id: 'receita-nova', label: 'Receita nova', inSentence: 'receita nova' },
      { id: 'ticket-medio', label: 'Ticket médio', inSentence: 'ticket médio' },
      { id: 'oportunidades-abertas', label: 'Oportunidades abertas', inSentence: 'oportunidades abertas' },
      { id: 'taxa-ganho', label: 'Taxa de ganho', inSentence: 'taxa de ganho' },
      { id: 'ciclo-venda', label: 'Ciclo de venda', inSentence: 'ciclo de venda' },
      { id: 'propostas-enviadas', label: 'Propostas enviadas', inSentence: 'propostas enviadas' },
      { id: 'valor-negociacao', label: 'Valor em negociação', inSentence: 'valor em negociação' },
      { id: 'previsao-receita', label: 'Previsão de receita', inSentence: 'previsão de receita' },
      { id: 'atingimento-meta', label: 'Atingimento de meta', inSentence: 'atingimento de meta' },
      { id: 'descontos', label: 'Descontos concedidos', inSentence: 'descontos concedidos' },
    ],
  },
  {
    id: 'dash-financeiro',
    label: 'Dashboard financeiro',
    inSentence: 'dashboard financeiro',
    leaves: [
      { id: 'receita-recorrente', label: 'Receita recorrente', inSentence: 'receita recorrente' },
      { id: 'inadimplencia', label: 'Inadimplência', inSentence: 'inadimplência' },
      { id: 'prazo-recebimento', label: 'Prazo de recebimento', inSentence: 'prazo de recebimento' },
      { id: 'custo-aquisicao', label: 'Custo de aquisição', inSentence: 'custo de aquisição' },
      { id: 'margem', label: 'Margem por contrato', inSentence: 'margem por contrato' },
      { id: 'receita-faturada', label: 'Receita faturada', inSentence: 'receita faturada' },
      { id: 'retorno-cliente', label: 'Retorno por cliente', inSentence: 'retorno por cliente' },
    ],
  },
  {
    id: 'dash-pos-venda',
    label: 'Dashboard de pós-venda',
    inSentence: 'dashboard de pós-venda',
    leaves: [
      { id: 'satisfacao', label: 'Satisfação do cliente', inSentence: 'satisfação do cliente' },
      { id: 'chamados-resolvidos', label: 'Chamados resolvidos', inSentence: 'chamados resolvidos' },
      { id: 'tempo-resolucao', label: 'Tempo de resolução', inSentence: 'tempo de resolução' },
      { id: 'clientes-risco', label: 'Clientes em risco', inSentence: 'clientes em risco' },
      { id: 'cancelamento', label: 'Taxa de cancelamento', inSentence: 'taxa de cancelamento' },
      { id: 'renovacoes', label: 'Renovações do mês', inSentence: 'renovações do mês' },
      { id: 'expansao', label: 'Expansão de contrato', inSentence: 'expansão de contrato' },
    ],
  },
  {
    id: 'dash-pre-vendas',
    label: 'Dashboard de pré-vendas',
    inSentence: 'dashboard de pré-vendas',
    leaves: [
      { id: 'tempo-resposta', label: 'Tempo de resposta', inSentence: 'tempo de resposta' },
      { id: 'leads-trabalhados', label: 'Leads trabalhados', inSentence: 'leads trabalhados' },
      { id: 'reunioes', label: 'Reuniões agendadas', inSentence: 'reuniões agendadas' },
      { id: 'comparecimento', label: 'Taxa de comparecimento', inSentence: 'taxa de comparecimento' },
      { id: 'sem-resposta', label: 'Leads sem resposta', inSentence: 'leads sem resposta' },
      { id: 'conversas-iniciadas', label: 'Conversas iniciadas', inSentence: 'conversas iniciadas' },
      { id: 'qualificacao', label: 'Taxa de qualificação', inSentence: 'taxa de qualificação' },
      { id: 'fila-espera', label: 'Fila de espera', inSentence: 'fila de espera' },
    ],
  },
  {
    id: 'dash-marketing',
    label: 'Dashboard de marketing',
    inSentence: 'dashboard de marketing',
    leaves: [
      { id: 'leads-gerados', label: 'Leads gerados', inSentence: 'leads gerados' },
      { id: 'custo-lead', label: 'Custo por lead', inSentence: 'custo por lead' },
      { id: 'leads-qualificados', label: 'Leads qualificados', inSentence: 'leads qualificados' },
      { id: 'conversao-site', label: 'Conversão do site', inSentence: 'conversão do site' },
      { id: 'visitantes', label: 'Visitantes únicos', inSentence: 'visitantes únicos' },
      { id: 'retorno-midia', label: 'Retorno sobre mídia', inSentence: 'retorno sobre mídia' },
      { id: 'custo-clique', label: 'Custo por clique', inSentence: 'custo por clique' },
      { id: 'alcance', label: 'Alcance de anúncios', inSentence: 'alcance de anúncios' },
    ],
  },
];

/** Fontes de cada indicador, na ordem dos dashboards: a chave é o indicador, a lista são as fontes. */
const sourcesByIndicator: Readonly<Record<string, readonly string[]>> = {
  'receita-nova': ['oportunidades', 'contratos', 'faturas'],
  'ticket-medio': ['oportunidades', 'faturas'],
  'oportunidades-abertas': ['oportunidades', 'contas'],
  'taxa-ganho': ['oportunidades', 'formulario'],
  'ciclo-venda': ['oportunidades', 'atividades'],
  'propostas-enviadas': ['propostas'],
  'valor-negociacao': ['oportunidades', 'propostas'],
  'previsao-receita': ['oportunidades', 'propostas', 'orcamento'],
  'atingimento-meta': ['contratos', 'orcamento'],
  descontos: ['propostas', 'contratos'],
  'receita-recorrente': ['contratos', 'faturas'],
  inadimplencia: ['faturas', 'recebimentos'],
  'prazo-recebimento': ['faturas', 'recebimentos'],
  'custo-aquisicao': ['investimento', 'orcamento', 'formulario'],
  margem: ['contratos', 'orcamento'],
  'receita-faturada': ['faturas'],
  'retorno-cliente': ['contratos', 'faturas', 'contas'],
  satisfacao: ['pesquisa'],
  'chamados-resolvidos': ['chamados'],
  'tempo-resolucao': ['chamados', 'conversas'],
  'clientes-risco': ['chamados', 'pesquisa', 'recebimentos'],
  cancelamento: ['contratos'],
  renovacoes: ['contratos', 'contas'],
  expansao: ['contratos', 'oportunidades'],
  'tempo-resposta': ['formulario', 'atividades'],
  'leads-trabalhados': ['formulario', 'atividades'],
  reunioes: ['atividades'],
  comparecimento: ['atividades'],
  'sem-resposta': ['formulario', 'atividades', 'chat'],
  'conversas-iniciadas': ['chat', 'conversas'],
  qualificacao: ['formulario', 'oportunidades'],
  'fila-espera': ['conversas'],
  'leads-gerados': ['formulario', 'chat'],
  'custo-lead': ['formulario', 'investimento'],
  'leads-qualificados': ['formulario', 'contas'],
  'conversao-site': ['formulario', 'sessoes', 'paginas'],
  visitantes: ['sessoes', 'paginas'],
  'retorno-midia': ['investimento', 'contratos', 'formulario'],
  'custo-clique': ['investimento', 'cliques'],
  alcance: ['impressoes'],
};

export const data: Lineage = {
  sources,
  indicators,
  links: Object.entries(sourcesByIndicator).flatMap(([to, list]) => list.map((from) => ({ from, to }))),
};
