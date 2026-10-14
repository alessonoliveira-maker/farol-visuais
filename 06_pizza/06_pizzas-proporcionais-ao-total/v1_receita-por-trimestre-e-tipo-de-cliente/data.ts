/**
 * Receita reconhecida por trimestre e tipo de cliente, em reais, do 3º trimestre de 2025 ao 2º
 * de 2026. Dado fictício e fixo: nenhum trimestre corresponde a um período real da casa.
 */
export interface RevenueSlice {
  readonly id: 'novo' | 'expansao' | 'renovacao';
  readonly name: string;
  readonly value: number;
}

export interface QuarterlyRevenue {
  readonly quarterId: string;
  readonly quarterLabel: string;
  /** Início do trimestre, YYYY-MM-DD. */
  readonly quarterStart: string;
  /** Ordem fixa das categorias: a mesma sequência e a mesma cor em todo trimestre (COR-3). */
  readonly slices: readonly RevenueSlice[];
}

export const data: readonly QuarterlyRevenue[] = [
  {
    quarterId: '2025-q3',
    quarterLabel: '3T 2025',
    quarterStart: '2025-07-01',
    slices: [
      { id: 'novo', name: 'Cliente novo', value: 120_000 },
      { id: 'expansao', name: 'Expansão', value: 160_000 },
      { id: 'renovacao', name: 'Renovação', value: 240_000 },
    ],
  },
  {
    quarterId: '2025-q4',
    quarterLabel: '4T 2025',
    quarterStart: '2025-10-01',
    slices: [
      { id: 'novo', name: 'Cliente novo', value: 180_000 },
      { id: 'expansao', name: 'Expansão', value: 210_000 },
      { id: 'renovacao', name: 'Renovação', value: 290_000 },
    ],
  },
  {
    quarterId: '2026-q1',
    quarterLabel: '1T 2026',
    quarterStart: '2026-01-01',
    slices: [
      { id: 'novo', name: 'Cliente novo', value: 260_000 },
      { id: 'expansao', name: 'Expansão', value: 260_000 },
      { id: 'renovacao', name: 'Renovação', value: 370_000 },
    ],
  },
  {
    quarterId: '2026-q2',
    quarterLabel: '2T 2026',
    quarterStart: '2026-04-01',
    slices: [
      { id: 'novo', name: 'Cliente novo', value: 420_000 },
      { id: 'expansao', name: 'Expansão', value: 380_000 },
      { id: 'renovacao', name: 'Renovação', value: 440_000 },
    ],
  },
];
