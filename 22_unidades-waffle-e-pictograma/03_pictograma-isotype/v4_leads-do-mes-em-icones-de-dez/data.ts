/**
 * Leads captados no mês por origem, em contagem de leads. `null` quer dizer origem sem coleta no mês.
 * Dado fictício e fixo: nenhum número é de operação real.
 *
 * Os casos difíceis: 347 leads viram 34 ícones inteiros (sem 35º cortado), uma origem com 8 leads fica
 * abaixo de um ícone e uma origem sem coleta não vira fileira vazia nem zero.
 */
export interface LeadsByOrigin {
  readonly id: string;
  readonly name: string;
  /** Leads do mês; `null` quando a origem não tem coleta (ausência nunca é zero). */
  readonly leads: number | null;
}

/** Mês do recorte em YYYY-MM. */
export const month = '2026-08';

export const data: readonly LeadsByOrigin[] = [
  { id: 'origem-parceiro', name: 'Parceiros de canal', leads: null },
  { id: 'origem-organico', name: 'Busca orgânica', leads: 168 },
  { id: 'origem-midia', name: 'Mídia paga', leads: 347 },
  { id: 'origem-evento', name: 'Eventos presenciais', leads: 8 },
  { id: 'origem-indicacao', name: 'Indicação de clientes', leads: 212 },
];
