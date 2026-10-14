/**
 * Pipeline aberto (R$) e fechamentos de 2026 T3 por executivo, agrupados por time comercial.
 * Dado fictício e fixo: nenhum nome é pessoa real. O subtotal de cada time é uma SOMA (pipeline
 * somado, fechamentos somados) e precisa fechar exatamente com a soma das linhas filhas abaixo.
 */
export interface Executive {
  readonly id: string;
  readonly name: string;
  readonly pipeline: number;
  readonly fechamentos: number;
}

export interface SalesTeam {
  readonly id: string;
  readonly name: string;
  readonly executives: readonly Executive[];
}

export const data: readonly SalesTeam[] = [
  {
    id: 'time-sp',
    name: 'Comercial SP',
    // Subtotal (soma): pipeline 929.200; fechamentos 6.
    executives: [
      { id: 'sp-01', name: 'Renata Bezerra M.', pipeline: 420_000, fechamentos: 3 },
      { id: 'sp-02', name: 'Thiago Nogueira A.', pipeline: 310_500, fechamentos: 2 },
      { id: 'sp-03', name: 'Camila Drummond S.', pipeline: 198_700, fechamentos: 1 },
    ],
  },
  {
    id: 'time-rj',
    name: 'Comercial RJ',
    // Subtotal (soma): pipeline 755.200; fechamentos 5.
    executives: [
      { id: 'rj-01', name: 'Diego Fontoura L.', pipeline: 275_000, fechamentos: 2 },
      { id: 'rj-02', name: 'Patrícia Wanderley T.', pipeline: 233_400, fechamentos: 2 },
      { id: 'rj-03', name: 'Eduardo Salgado B.', pipeline: 150_000, fechamentos: 0 },
      { id: 'rj-04', name: 'Juliana Prestes G.', pipeline: 96_800, fechamentos: 1 },
    ],
  },
  {
    id: 'time-sc',
    name: 'Comercial SC',
    // Subtotal (soma): pipeline 801.400; fechamentos 6.
    executives: [
      { id: 'sc-01', name: 'Otávio Cerqueira B.', pipeline: 512_300, fechamentos: 4 },
      { id: 'sc-02', name: 'Luiza Monteiro G.', pipeline: 289_100, fechamentos: 2 },
    ],
  },
];
