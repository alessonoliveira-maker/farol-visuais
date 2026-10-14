/**
 * Leads por origem e mês em 2026, com as três respostas que uma célula sem número pode dar.
 * `'vazio'` é combinação sem captação ainda (a origem nasceu depois daquele mês, o dado
 * simplesmente não existe). `'na'` é combinação que não se aplica (um piloto com janela
 * fixa de meses; fora dela não é que faltou medir, é que o piloto não rodava). Um número,
 * incluindo 0, é sempre contagem medida. Dado fictício e fixo: nenhum nome é pessoa ou
 * empresa real.
 */
export type OriginMonthCell = number | 'vazio' | 'na';

export interface OriginMonthlyLeadsWithGaps {
  readonly id: string;
  readonly name: string;
  /** Uma entrada por MONTHS, na mesma ordem. */
  readonly counts: readonly OriginMonthCell[];
}

export const MONTHS: readonly string[] = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
  '2026-11',
  '2026-12',
];

export const data: readonly OriginMonthlyLeadsWithGaps[] = [
  { id: 'org-01', name: 'Indicação', counts: [12, 14, 11, 15, 13, 0, 14, 17, 15, 18, 16, 19] },
  { id: 'org-02', name: 'Site institucional', counts: [22, 19, 24, 20, 26, 21, 25, 23, 28, 24, 27, 30] },
  { id: 'org-03', name: 'Rede social paga', counts: [31, 28, 33, 29, 35, 27, 30, 26, 24, 22, 20, 18] },
  { id: 'org-04', name: 'Busca paga', counts: [18, 20, 17, 22, 0, 24, 21, 26, 23, 28, 25, 30] },
  { id: 'org-05', name: 'Rede social B2B', counts: [5, 6, 4, 7, 6, 8, 7, 9, 8, 10, 9, 11] },
  {
    id: 'org-06',
    name: 'Rádio Regional',
    counts: ['vazio', 'vazio', 'vazio', 'vazio', 'vazio', 6, 9, 7, 11, 8, 10, 12],
  },
  {
    id: 'org-07',
    name: 'Programa Piloto Referral',
    counts: ['na', 'na', 'na', 'na', 14, 22, 9, 'na', 'na', 'na', 'na', 'na'],
  },
  { id: 'org-08', name: 'Outbound SDR', counts: [14, 13, 15, 12, 16, 14, 0, 15, 18, 16, 19, 17] },
];
