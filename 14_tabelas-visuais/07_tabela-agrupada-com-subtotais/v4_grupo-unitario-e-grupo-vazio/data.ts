/**
 * Dias corridos até o fechamento de cada negócio ganho em 2026 T3, agrupados por time. Dado
 * fictício e fixo. O subtotal de time é a MEDIANA dos dias, não a soma nem a média: um único
 * negócio muito lento distorce a média, e a mediana é a medida usual de tendência central para
 * duração. `executives` vazio simula um time que o filtro esvaziou sem sumir da tabela.
 */
export interface Executive {
  readonly id: string;
  readonly name: string;
  readonly diasParaFechar: number;
}

export interface SalesTeam {
  readonly id: string;
  readonly name: string;
  readonly executives: readonly Executive[];
}

export const data: readonly SalesTeam[] = [
  {
    id: 'time-nordeste',
    name: 'Comercial Nordeste',
    // Grupo unitário: um único executivo, sem subtotal redundante.
    executives: [{ id: 'ne-01', name: 'Isadora Meneses V.', diasParaFechar: 34 }],
  },
  {
    id: 'time-centro-oeste',
    name: 'Comercial Centro-Oeste',
    // Grupo vazio: o filtro do recorte não deixou nenhum negócio ganho neste time.
    executives: [],
  },
  {
    id: 'time-sul',
    name: 'Comercial Sul',
    // Subtotal (mediana): 12, 15, 18, 22, 51 dias, ordenados, mediana = 18.
    executives: [
      { id: 'sul-01', name: 'Rogério Baptista C.', diasParaFechar: 18 },
      { id: 'sul-02', name: 'Helena Wagner P.', diasParaFechar: 12 },
      { id: 'sul-03', name: 'Caetano Figueira L.', diasParaFechar: 51 },
      { id: 'sul-04', name: 'Beatriz Colombo A.', diasParaFechar: 15 },
      { id: 'sul-05', name: 'Nelson Trindade S.', diasParaFechar: 22 },
    ],
  },
];
