/**
 * Receita reconhecida por executivo no trimestre de 2026-07 a 2026-09, em reais.
 * Dado fictício e fixo: nenhum nome é pessoa real. A ordem abaixo é a do banco, de propósito
 * fora de ordem; há um empate (Fabrício S. e Giovana T.) e um valor pequeno para exercitar o visual.
 */
export interface ExecutiveRevenue {
  readonly id: string;
  readonly name: string;
  readonly revenue: number;
}

export const data: readonly ExecutiveRevenue[] = [
  { id: 'exec-03', name: 'Henrique P.', revenue: 301_750 },
  { id: 'exec-07', name: 'Maria Clara D.', revenue: 38_120 },
  { id: 'exec-01', name: 'Bianca R.', revenue: 512_300 },
  { id: 'exec-05', name: 'Giovana T.', revenue: 196_400 },
  { id: 'exec-06', name: 'Leandro V.', revenue: 142_900 },
  { id: 'exec-02', name: 'Caetano M.', revenue: 448_200 },
  { id: 'exec-04', name: 'Fabrício S.', revenue: 196_400 },
  { id: 'exec-08', name: 'Débora L.', revenue: 87_600 },
];
