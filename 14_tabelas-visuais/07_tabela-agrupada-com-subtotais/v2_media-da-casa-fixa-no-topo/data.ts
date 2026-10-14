/**
 * Oportunidades ganhas e totais por executivo em 2026 T3, agrupadas por time. Dado fictício e
 * fixo: nenhum nome é pessoa real. O subtotal de cada time e a média da casa são MÉDIAS
 * ponderadas (soma dos ganhos dividida pela soma do total do grupo), não a média simples dos
 * percentuais de cada linha, porque a média simples trataria um executivo com 2 oportunidades
 * como se pesasse o mesmo que um com 20.
 */
export interface Executive {
  readonly id: string;
  readonly name: string;
  readonly wins: number;
  readonly total: number;
}

export interface SalesTeam {
  readonly id: string;
  readonly name: string;
  readonly executives: readonly Executive[];
}

export const data: readonly SalesTeam[] = [
  {
    id: 'time-consultivo',
    name: 'Time Consultivo',
    // Subtotal (média ponderada): 14 de 35 = 40,0%.
    executives: [
      { id: 'cons-01', name: 'Bianca Malafaia R.', wins: 9, total: 15 },
      { id: 'cons-02', name: 'Vinícius Amaral P.', wins: 5, total: 20 },
    ],
  },
  {
    id: 'time-digital',
    name: 'Time Digital',
    // Subtotal (média ponderada): 13 de 40 = 32,5%.
    executives: [
      { id: 'dig-01', name: 'Fernanda Quintão L.', wins: 10, total: 22 },
      { id: 'dig-02', name: 'Marcelo Barreto V.', wins: 3, total: 18 },
    ],
  },
  {
    id: 'time-key',
    name: 'Time Key Accounts',
    // Subtotal (média ponderada): 12 de 30 = 40,0%.
    executives: [
      { id: 'key-01', name: 'Adriana Peixoto F.', wins: 6, total: 8 },
      { id: 'key-02', name: 'Rodrigo Salviano N.', wins: 4, total: 10 },
      { id: 'key-03', name: 'Sabrina Toledo C.', wins: 2, total: 12 },
    ],
  },
];
