/**
 * Leads do mês por campanha, em contagem de leads, com uma cauda longa de campanhas pequenas.
 * Dado fictício e fixo: nenhum nome é campanha, produto ou empresa real.
 *
 * A regra da cauda mora NO DADO, em `tailMaxShare`: campanha abaixo dessa fração dos leads do mês
 * não ganha fatia própria e entra em "Outros". São 23 campanhas nessa condição, a maior delas com
 * 8 leads, ou 0,95% do mês. O painel de detalhe abre as `detailRows` maiores e resume o resto numa
 * linha escrita, porque rolagem não existe em cartão e reticência apagaria nome de campanha.
 */
export interface CampaignNamed {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  /** Slot categórico fixo (índice em CHART_SERIES_COLORS), na ordem da COR-8. */
  readonly slot: number;
}

export interface CampaignTailRow {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
}

export interface CampaignTailData {
  readonly named: readonly CampaignNamed[];
  readonly tail: readonly CampaignTailRow[];
  /** Teto da cauda: abaixo desta fração do mês a campanha vai para "Outros". */
  readonly tailMaxShare: number;
  /** Quantas linhas da cauda o painel desenha; o resto vira contagem escrita. */
  readonly detailRows: number;
  readonly month: string;
}

export const data: CampaignTailData = {
  named: [
    { id: 'institucional', name: 'Institucional sempre ativo', leads: 268, slot: 0 },
    { id: 'base-fria', name: 'Retomada de base fria', leads: 197, slot: 2 },
    { id: 'webinario-sucessao', name: 'Webinário de sucessão', leads: 154, slot: 5 },
    { id: 'busca-marca', name: 'Busca por marca', leads: 121, slot: 4 },
  ],
  tail: [
    { id: 'sucessao-familias', name: 'Sucessão para famílias', leads: 8 },
    { id: 'renda-fixa-isenta', name: 'Renda fixa isenta', leads: 8 },
    { id: 'carta-do-gestor', name: 'Carta mensal do gestor', leads: 7 },
    { id: 'convite-cafe', name: 'Convite para café', leads: 7 },
    { id: 'diagnostico-carteira', name: 'Diagnóstico de carteira', leads: 7 },
    { id: 'guia-holding', name: 'Guia de holding', leads: 6 },
    { id: 'fundo-imobiliario', name: 'Fundo imobiliário', leads: 6 },
    { id: 'reforma-tributaria', name: 'Reforma tributária', leads: 6 },
    { id: 'planilha-gastos', name: 'Planilha de gastos', leads: 5 },
    { id: 'podcast-patrimonio', name: 'Podcast de patrimônio', leads: 5 },
    { id: 'webinario-cambio', name: 'Webinário de câmbio', leads: 4 },
    { id: 'educacao-financeira', name: 'Educação financeira', leads: 4 },
    { id: 'calculadora-ir', name: 'Calculadora de imposto', leads: 4 },
    { id: 'agenda-eventos', name: 'Agenda de eventos', leads: 3 },
    { id: 'clube-de-leitura', name: 'Clube de leitura', leads: 3 },
    { id: 'trilha-sucessao', name: 'Trilha de sucessão', leads: 3 },
    { id: 'boletim-semanal', name: 'Boletim semanal', leads: 3 },
    { id: 'mapa-investidores', name: 'Mapa de investidores', leads: 2 },
    { id: 'roteiro-doacao', name: 'Roteiro de doação', leads: 2 },
    { id: 'painel-indicadores', name: 'Painel de indicadores', leads: 2 },
    { id: 'feira-de-negocios', name: 'Feira de negócios', leads: 2 },
    { id: 'aula-previdencia', name: 'Aula de previdência', leads: 1 },
    { id: 'curso-valuation', name: 'Curso de avaliação', leads: 1 },
  ],
  tailMaxShare: 0.01,
  detailRows: 10,
  month: '2026-08',
};
