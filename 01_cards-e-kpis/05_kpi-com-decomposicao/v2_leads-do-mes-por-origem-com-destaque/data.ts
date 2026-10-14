/**
 * Leads recebidos no mês por origem, em contagem de leads. Dado fictício e fixo.
 *
 * `origins` é a configuração da métrica: dá o nome e a ORDEM dos segmentos, que não muda de um mês
 * para outro. `counts` é o que a consulta devolve, ordenado por valor; o cartão reordena pela
 * configuração, e por isso a barra sai com 52%, 15%, 24% e 9%, fora da ordem de tamanho.
 * O caso difícil é o segmento pequeno de eventos (menos de 10%) e o nome mais longo da busca orgânica.
 */
export interface LeadOrigin {
  readonly key: string;
  readonly label: string;
}

export interface OriginCount {
  readonly key: string;
  readonly count: number;
}

export interface LeadsByOrigin {
  readonly label: string;
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Origens na ordem da configuração da métrica. */
  readonly origins: readonly LeadOrigin[];
  /** Contagem por origem como a consulta devolve, ou `null` quando não houve coleta no mês. */
  readonly counts: readonly OriginCount[] | null;
}

export const data: LeadsByOrigin = {
  label: 'Leads recebidos',
  month: '2026-08',
  origins: [
    { key: 'paid-media', label: 'Mídia paga' },
    { key: 'organic', label: 'Busca orgânica e site institucional' },
    { key: 'referral', label: 'Indicação de cliente' },
    { key: 'events', label: 'Eventos e parcerias' },
  ],
  counts: [
    { key: 'paid-media', count: 214 },
    { key: 'referral', count: 98 },
    { key: 'organic', count: 61 },
    { key: 'events', count: 39 },
  ],
};

/** A origem acesa: mídia paga é a pergunta da reunião de marketing. */
export const highlightKey = 'paid-media';
