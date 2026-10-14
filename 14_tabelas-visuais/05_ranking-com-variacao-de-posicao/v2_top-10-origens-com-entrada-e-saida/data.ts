/**
 * Top 10 origens por leads qualificados em 2026-09 contra 2026-08, em contagem de leads.
 * `posAnterior` e `valueAnterior` vêm `null` quando a origem não estava no top 10 do mês
 * anterior (entrada nova). `saidas` traz as origens que caíram do top 10: última posição e
 * valor conhecidos, sem posição nem valor no mês atual, porque fora do top 10 elas não são
 * acompanhadas linha a linha. Dado fictício e fixo: nenhuma marca ou empresa é real.
 */
export interface RankingRow {
  readonly id: string;
  readonly name: string;
  readonly pos: number;
  readonly posAnterior: number | null;
  readonly value: number;
  readonly valueAnterior: number | null;
}

export interface SaidaRow {
  readonly id: string;
  readonly name: string;
  readonly posAnterior: number;
  readonly valueAnterior: number;
}

export const mesAtual = '2026-09';
export const mesAnterior = '2026-08';

export const data: readonly RankingRow[] = [
  { id: 'origem-cliente', name: 'Indicação de cliente', pos: 1, posAnterior: 1, value: 142, valueAnterior: 138 },
  { id: 'origem-organica', name: 'Busca orgânica', pos: 2, posAnterior: 3, value: 118, valueAnterior: 96 },
  { id: 'origem-busca-marca', name: 'Busca paga de marca', pos: 3, posAnterior: 2, value: 107, valueAnterior: 101 },
  { id: 'origem-rede-b2b', name: 'Rede social paga B2B', pos: 4, posAnterior: 5, value: 89, valueAnterior: 74 },
  { id: 'origem-webinar-set', name: 'Webinar de setembro', pos: 5, posAnterior: null, value: 81, valueAnterior: null },
  { id: 'origem-newsletter', name: 'Newsletter mensal', pos: 6, posAnterior: 4, value: 76, valueAnterior: 88 },
  { id: 'origem-busca-generica', name: 'Busca paga genérica', pos: 7, posAnterior: 6, value: 64, valueAnterior: 71 },
  { id: 'origem-rede-organica', name: 'Rede social orgânica', pos: 8, posAnterior: 9, value: 52, valueAnterior: 41 },
  { id: 'origem-evento', name: 'Evento do setor imobiliário', pos: 9, posAnterior: null, value: 47, valueAnterior: null },
  { id: 'origem-rede-secundaria', name: 'Rede social paga secundária', pos: 10, posAnterior: 8, value: 39, valueAnterior: 58 },
];

export const saidas: readonly SaidaRow[] = [
  { id: 'origem-parceiro', name: 'Indicação de parceiro', posAnterior: 7, valueAnterior: 63 },
  { id: 'origem-feira', name: 'Feira de imóveis', posAnterior: 10, valueAnterior: 33 },
];
