/**
 * Leads recebidos no mês, em contagem de leads, com a origem registrada de cada um. Dado fictício e fixo.
 *
 * `origins` vem em ordem alfabética, como uma consulta qualquer devolveria: quem ordena é o cartão.
 * Casos difíceis de propósito: 14 origens (9 ficam em demais), 114 leads sem origem registrada (22% do
 * total), um nome longo que precisa aparecer inteiro e um empate em 37 leads na fronteira do quinto
 * lugar, que o desempate pelo nome resolve sempre do mesmo jeito.
 */
export interface OriginLeads {
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

export interface LeadsContribution {
  readonly label: string;
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Total de leads do mês, contando os sem origem; `null` quando não houve coleta. */
  readonly total: number | null;
  /** Origens registradas, em qualquer ordem. */
  readonly origins: readonly OriginLeads[];
  /** Leads que chegaram sem origem registrada: linha própria, nunca somados a demais. */
  readonly unlabeled: number;
}

export const data: LeadsContribution = {
  label: 'Leads recebidos',
  month: '2026-08',
  total: 520,
  unlabeled: 114,
  origins: [
    { id: 'paid-search', name: 'Busca paga', count: 118 },
    { id: 'site-chat', name: 'Chat do site', count: 1 },
    { id: 'in-person-event', name: 'Evento presencial', count: 6 },
    { id: 'agribusiness-fair', name: 'Feira do agronegócio', count: 1 },
    { id: 'press', name: 'Imprensa', count: 3 },
    { id: 'client-referral', name: 'Indicação de cliente', count: 44 },
    { id: 'fidc-guide', name: 'Material sobre FIDC', count: 1 },
    { id: 'newsletter', name: 'Newsletter mensal', count: 9 },
    { id: 'accounting-partner', name: 'Parceiro contábil', count: 2 },
    { id: 'sponsored-podcast', name: 'Podcast patrocinado', count: 4 },
    { id: 'paid-professional-network', name: 'Rede profissional paga', count: 37 },
    { id: 'paid-social', name: 'Rede social paga', count: 92 },
    { id: 'institutional-site', name: 'Site institucional', count: 37 },
    { id: 'succession-webinar', name: 'Webinar de sucessão patrimonial com escritórios parceiros', count: 51 },
  ],
};
