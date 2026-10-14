/**
 * Receita nova fechada por executivo no trimestre, em reais.
 * Dado fictício e fixo: os nomes vêm da lista inventada do Farol, nenhum é pessoa real.
 */
export interface ExecutiveRevenue {
  readonly id: string;
  readonly name: string;
  readonly revenue: number;
}

export const data: readonly ExecutiveRevenue[] = [
  { id: 'exec-01', name: 'Talita V.', revenue: 312_400 },
  { id: 'exec-02', name: 'Murilo C.', revenue: 486_900 },
  { id: 'exec-03', name: 'Ingrid S.', revenue: 198_700 },
  { id: 'exec-04', name: 'Renan A.', revenue: 401_250 },
  { id: 'exec-05', name: 'Lorena B.', revenue: 264_800 },
  { id: 'exec-06', name: 'Heitor M.', revenue: 143_600 },
  { id: 'exec-07', name: 'Priscila T.', revenue: 229_300 },
  { id: 'exec-08', name: 'Otavio R.', revenue: 97_450 },
];

/** A barra acesa por padrão: a pessoa que abriu o painel. */
export const highlightId = 'exec-04';
