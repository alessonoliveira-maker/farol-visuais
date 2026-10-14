/**
 * Receita reconhecida por executivo no trimestre 2026-T3, em reais.
 * Dado fictício e fixo: nenhum nome é pessoa real. Ordem de entrada é irrelevante, o
 * componente ordena por receita decrescente.
 */
export interface ExecutiveRevenue {
  readonly id: string;
  readonly name: string;
  readonly revenue: number;
}

export const data: readonly ExecutiveRevenue[] = [
  { id: 'exec-01', name: 'Marina Albuquerque C.', revenue: 1_284_600 },
  { id: 'exec-02', name: 'Diego Fontoura L.', revenue: 1_138_900 },
  { id: 'exec-03', name: 'Bartolomeu Nascimento T.', revenue: 998_200 },
  { id: 'exec-04', name: 'Yasmin Petronilha R.', revenue: 942_700 },
  { id: 'exec-05', name: 'Otávio Cerqueira B.', revenue: 861_300 },
  { id: 'exec-06', name: 'Luiza Monteiro G.', revenue: 803_400 },
  { id: 'exec-07', name: 'Felipe Andrade Q.', revenue: 715_600 },
  { id: 'exec-08', name: 'Camila Restrepo S.', revenue: 664_800 },
  { id: 'exec-09', name: 'Henrique Bandeira P.', revenue: 588_100 },
  { id: 'exec-10', name: 'Priscila Warmling D.', revenue: 511_900 },
  { id: 'exec-11', name: 'Igor Salomão F.', revenue: 402_300 },
  { id: 'exec-12', name: 'Aline Tancredo M.', revenue: 96_800 },
];
