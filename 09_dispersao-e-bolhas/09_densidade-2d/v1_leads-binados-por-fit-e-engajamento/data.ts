/**
 * Leads captados no semestre, já binados em faixas de 10 pontos de pontuação de fit e de
 * engajamento (0 a 100 cada, portanto 10 faixas por eixo, `fitBin` e `engajamentoBin` de 0 a 9).
 * Cada linha é uma célula da grade com pelo menos 1 lead; o cruzamento que não aparece aqui é
 * célula vazia, sem nenhum lead, e não é a mesma coisa que célula com poucos leads.
 * Dado fictício e fixo: pontuação de fit e de engajamento inventadas, nenhum lead é pessoa real.
 */
export interface FitEngagementBin {
  /** Faixa de fit: 0 cobre a pontuação de 0 a 10, 9 cobre 90 a 100. */
  readonly fitBin: number;
  /** Faixa de engajamento, na mesma régua do fit. */
  readonly engajamentoBin: number;
  readonly count: number;
}

export const data: readonly FitEngagementBin[] = [
  { fitBin: 0, engajamentoBin: 2, count: 4 },
  { fitBin: 0, engajamentoBin: 3, count: 7 },
  { fitBin: 0, engajamentoBin: 4, count: 4 },
  { fitBin: 1, engajamentoBin: 1, count: 4 },
  { fitBin: 1, engajamentoBin: 2, count: 15 },
  { fitBin: 1, engajamentoBin: 3, count: 23 },
  { fitBin: 1, engajamentoBin: 4, count: 15 },
  { fitBin: 1, engajamentoBin: 5, count: 4 },
  { fitBin: 2, engajamentoBin: 1, count: 7 },
  { fitBin: 2, engajamentoBin: 2, count: 23 },
  { fitBin: 2, engajamentoBin: 3, count: 35 },
  { fitBin: 2, engajamentoBin: 4, count: 23 },
  { fitBin: 2, engajamentoBin: 5, count: 7 },
  { fitBin: 3, engajamentoBin: 1, count: 4 },
  { fitBin: 3, engajamentoBin: 2, count: 15 },
  { fitBin: 3, engajamentoBin: 3, count: 23 },
  { fitBin: 3, engajamentoBin: 4, count: 15 },
  { fitBin: 3, engajamentoBin: 5, count: 5 },
  { fitBin: 4, engajamentoBin: 2, count: 4 },
  { fitBin: 4, engajamentoBin: 3, count: 7 },
  { fitBin: 4, engajamentoBin: 4, count: 5 },
  { fitBin: 4, engajamentoBin: 5, count: 3 },
  { fitBin: 4, engajamentoBin: 6, count: 5 },
  { fitBin: 4, engajamentoBin: 7, count: 9 },
  { fitBin: 4, engajamentoBin: 8, count: 11 },
  { fitBin: 4, engajamentoBin: 9, count: 9 },
  { fitBin: 5, engajamentoBin: 5, count: 7 },
  { fitBin: 5, engajamentoBin: 6, count: 22 },
  { fitBin: 5, engajamentoBin: 7, count: 42 },
  { fitBin: 5, engajamentoBin: 8, count: 53 },
  { fitBin: 5, engajamentoBin: 9, count: 42 },
  { fitBin: 6, engajamentoBin: 4, count: 5 },
  { fitBin: 6, engajamentoBin: 5, count: 22 },
  { fitBin: 6, engajamentoBin: 6, count: 66 },
  { fitBin: 6, engajamentoBin: 7, count: 129 },
  { fitBin: 6, engajamentoBin: 8, count: 161 },
  { fitBin: 6, engajamentoBin: 9, count: 129 },
  { fitBin: 7, engajamentoBin: 4, count: 9 },
  { fitBin: 7, engajamentoBin: 5, count: 42 },
  { fitBin: 7, engajamentoBin: 6, count: 129 },
  { fitBin: 7, engajamentoBin: 7, count: 251 },
  { fitBin: 7, engajamentoBin: 8, count: 313 },
  { fitBin: 7, engajamentoBin: 9, count: 251 },
  { fitBin: 8, engajamentoBin: 4, count: 11 },
  { fitBin: 8, engajamentoBin: 5, count: 53 },
  { fitBin: 8, engajamentoBin: 6, count: 161 },
  { fitBin: 8, engajamentoBin: 7, count: 313 },
  { fitBin: 8, engajamentoBin: 8, count: 395 },
  { fitBin: 8, engajamentoBin: 9, count: 313 },
  { fitBin: 9, engajamentoBin: 4, count: 9 },
  { fitBin: 9, engajamentoBin: 5, count: 42 },
  { fitBin: 9, engajamentoBin: 6, count: 129 },
  { fitBin: 9, engajamentoBin: 7, count: 251 },
  { fitBin: 9, engajamentoBin: 8, count: 313 },
  { fitBin: 9, engajamentoBin: 9, count: 251 },
];

/** O que o total conta e o período, impresso depois do número. */
export const totalCaption = 'leads do semestre';
