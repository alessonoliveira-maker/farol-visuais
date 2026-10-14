/**
 * Leads por origem em ago/26 contra o mês anterior, jul/26 (contagem de leads novos).
 * Seis origens, uma com nome longo, uma que caiu muito, uma estável e uma lançada neste mês,
 * sem nenhum mês anterior medido (`previous: null`, que não é zero). Dado fictício e fixo.
 */
export interface OriginLeads {
  readonly id: string;
  readonly name: string;
  /** Leads do mês atual. */
  readonly current: number;
  /** Leads do mês anterior; `null` quando a origem não existia ou não foi medida. */
  readonly previous: number | null;
}

export interface OriginComparison {
  /** Mês atual, no formato YYYY-MM. */
  readonly month: string;
  /** Mês de referência, no formato YYYY-MM. */
  readonly previousMonth: string;
  readonly rows: readonly OriginLeads[];
}

export const data: OriginComparison = {
  month: '2026-08',
  previousMonth: '2026-07',
  rows: [
    { id: 'origem-01', name: 'Anúncios pagos', current: 212, previous: 188 },
    { id: 'origem-02', name: 'Busca orgânica', current: 164, previous: 171 },
    { id: 'origem-03', name: 'Indicação de clientes ativos', current: 97, previous: 74 },
    { id: 'origem-04', name: 'Parcerias com revendas', current: 61, previous: 62 },
    { id: 'origem-05', name: 'Eventos presenciais', current: 38, previous: 52 },
    { id: 'origem-06', name: 'Webinar de lançamento', current: 29, previous: null },
  ],
};
