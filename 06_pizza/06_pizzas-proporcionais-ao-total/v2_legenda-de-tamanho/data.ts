/**
 * Receita reconhecida por trimestre e linha de serviço, em reais, do 1º ao 4º trimestre de 2026.
 * Dado fictício e fixo: nenhum trimestre, nenhuma linha e nenhum valor corresponde a algo real.
 *
 * O maior total do recorte é exatamente R$ 2.000.000, e é dele que a régua de tamanho sai: o
 * degrau de cima é o maior total OBSERVADO e o de baixo é um quarto dele, R$ 500.000 (ROT-5b).
 */
export interface ServiceSlice {
  readonly id: 'carteira' | 'consultoria' | 'estruturacao';
  readonly name: string;
  readonly value: number;
}

export interface QuarterRevenue {
  readonly quarterId: string;
  readonly quarterLabel: string;
  /** Início do trimestre, YYYY-MM-DD. */
  readonly quarterStart: string;
  /** Ordem fixa das linhas de serviço: a mesma sequência e a mesma cor em todo trimestre (COR-3). */
  readonly slices: readonly ServiceSlice[];
}

export const data: readonly QuarterRevenue[] = [
  {
    quarterId: '2026-q1',
    quarterLabel: '1T 2026',
    quarterStart: '2026-01-01',
    slices: [
      { id: 'carteira', name: 'Carteira', value: 320_000 },
      { id: 'consultoria', name: 'Consultoria', value: 240_000 },
      { id: 'estruturacao', name: 'Estruturação', value: 160_000 },
    ],
  },
  {
    quarterId: '2026-q2',
    quarterLabel: '2T 2026',
    quarterStart: '2026-04-01',
    slices: [
      { id: 'carteira', name: 'Carteira', value: 480_000 },
      { id: 'consultoria', name: 'Consultoria', value: 380_000 },
      { id: 'estruturacao', name: 'Estruturação', value: 260_000 },
    ],
  },
  {
    quarterId: '2026-q3',
    quarterLabel: '3T 2026',
    quarterStart: '2026-07-01',
    slices: [
      { id: 'carteira', name: 'Carteira', value: 660_000 },
      { id: 'consultoria', name: 'Consultoria', value: 520_000 },
      { id: 'estruturacao', name: 'Estruturação', value: 380_000 },
    ],
  },
  {
    quarterId: '2026-q4',
    quarterLabel: '4T 2026',
    quarterStart: '2026-10-01',
    slices: [
      { id: 'carteira', name: 'Carteira', value: 840_000 },
      { id: 'consultoria', name: 'Consultoria', value: 680_000 },
      { id: 'estruturacao', name: 'Estruturação', value: 480_000 },
    ],
  },
];
