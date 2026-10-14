/**
 * Leads, CPL qualificado e investimento por origem em ago/26, cada um contra jul/26.
 * Dado fictício e fixo: as origens são genéricas e os valores são inventados.
 *
 * Os casos difíceis: o evento presencial tinha 6 leads em jul/26, base pequena em que +50% seria
 * manchete e +3 leads é o que cabe; o parceiro novo não tinha lead nenhum, então não há variação a
 * calcular; a lista fria não teve coleta de lead em ago/26 (`null`), mas teve investimento; e o CPL
 * qualificado tem polaridade invertida, porque subir é pior.
 */

export type Polarity = 'higher-is-better' | 'lower-is-better' | 'neutral';

/** O mesmo número em dois meses; `null` é ausência de medição, nunca zero. */
export interface MonthPair {
  readonly current: number | null;
  readonly previous: number | null;
}

export interface OriginRow {
  readonly id: string;
  readonly name: string;
  readonly leads: MonthPair;
  /** CPL qualificado em reais. */
  readonly cpl: MonthPair;
  /** Investimento do mês em reais. */
  readonly spend: MonthPair;
}

export interface OriginBoard {
  /** Mês corrente e mês da base, em YYYY-MM. */
  readonly month: string;
  readonly baseMonth: string;
  /** Polaridade de cada medida: o tom da pílula sai daqui, nunca do sinal. */
  readonly polarity: { readonly leads: Polarity; readonly cpl: Polarity; readonly spend: Polarity };
  /** Base de leads abaixo da qual a pílula mostra o delta absoluto em vez do percentual. */
  readonly smallBaseBelow: number;
  /** Variação relativa dentro da qual a pílula fica neutra, com o glifo Minus. */
  readonly flatWithin: number;
  readonly rows: readonly OriginRow[];
}

export const data: OriginBoard = {
  month: '2026-08',
  baseMonth: '2026-07',
  polarity: { leads: 'higher-is-better', cpl: 'lower-is-better', spend: 'neutral' },
  smallBaseBelow: 10,
  flatWithin: 0.01,
  rows: [
    {
      id: 'referral',
      name: 'Indicação',
      leads: { current: 48, previous: 40 },
      cpl: { current: 82, previous: 78 },
      spend: { current: 3_936, previous: 3_120 },
    },
    {
      id: 'paid-search',
      name: 'Busca paga',
      leads: { current: 62, previous: 70 },
      cpl: { current: 126, previous: 118 },
      spend: { current: 7_812, previous: 8_260 },
    },
    {
      id: 'social',
      name: 'Redes sociais',
      leads: { current: 31, previous: 31 },
      cpl: { current: 96, previous: 100 },
      spend: { current: 2_976, previous: 3_100 },
    },
    {
      id: 'events',
      name: 'Evento presencial',
      leads: { current: 9, previous: 6 },
      cpl: { current: 210, previous: 240 },
      spend: { current: 1_890, previous: 1_440 },
    },
    {
      id: 'new-partner',
      name: 'Parceiro novo',
      leads: { current: 14, previous: 0 },
      cpl: { current: 88, previous: null },
      spend: { current: 1_232, previous: 0 },
    },
    {
      id: 'cold-list',
      name: 'Lista fria',
      leads: { current: null, previous: 22 },
      cpl: { current: null, previous: 118 },
      spend: { current: 2_400, previous: 2_600 },
    },
  ],
};
