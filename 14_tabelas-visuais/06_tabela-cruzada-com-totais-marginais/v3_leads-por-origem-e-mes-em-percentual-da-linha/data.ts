/**
 * Leads captados em 2026, por origem (linha) e mês (coluna), em contagem absoluta. A tela lê
 * por padrão em percentual da linha: cada origem soma 100% nos seus 12 meses, e o total
 * absoluto do ano vive na margem. Todas as combinações têm registro; zero é contagem medida.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 */
export interface OriginMonthlyLeads {
  readonly id: string;
  readonly name: string;
  /** Uma entrada por MONTHS, na mesma ordem, sempre medida (nunca null nesta versão). */
  readonly counts: readonly number[];
}

/** Os 12 meses de 2026, em ordem, formato YYYY-MM. */
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

export const data: readonly OriginMonthlyLeads[] = [
  { id: 'org-01', name: 'Indicação', counts: [12, 14, 11, 15, 13, 16, 14, 17, 15, 18, 16, 19] },
  { id: 'org-02', name: 'Cliente ativo', counts: [8, 9, 7, 10, 9, 11, 10, 12, 11, 13, 12, 14] },
  { id: 'org-03', name: 'Site institucional', counts: [22, 19, 24, 20, 26, 21, 25, 23, 28, 24, 27, 30] },
  { id: 'org-04', name: 'Rede social paga', counts: [31, 28, 33, 29, 35, 27, 30, 26, 24, 22, 20, 18] },
  { id: 'org-05', name: 'Busca paga', counts: [18, 20, 17, 22, 19, 24, 21, 26, 23, 28, 25, 30] },
  { id: 'org-06', name: 'Webinar', counts: [0, 0, 42, 0, 0, 0, 38, 0, 0, 0, 45, 0] },
  { id: 'org-07', name: 'Feira Setorial de Concessionárias', counts: [0, 0, 0, 0, 0, 0, 0, 0, 61, 0, 0, 0] },
  { id: 'org-08', name: 'Parceria contábil', counts: [3, 2, 4, 3, 2, 5, 3, 4, 2, 3, 4, 5] },
  { id: 'org-09', name: 'Rede social B2B', counts: [5, 6, 4, 7, 6, 8, 7, 9, 8, 10, 9, 11] },
  { id: 'org-10', name: 'Outbound SDR', counts: [14, 13, 15, 12, 16, 14, 17, 15, 18, 16, 19, 17] },
];
