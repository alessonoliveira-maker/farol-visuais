/**
 * Demanda projetada de oportunidades por mês em 2027, em contagem, contra a capacidade medida
 * da pré-vendas, que sobe em degraus conforme a contratação prevista. Dado fictício e fixo:
 * nenhuma pessoa ou empresa real.
 */
export interface MonthlyDemand {
  readonly month: string;
  readonly demand: number;
  readonly capacity: number;
}

export const data: readonly MonthlyDemand[] = [
  { month: '2027-01', demand: 150, capacity: 0 },
  { month: '2027-02', demand: 180, capacity: 200 },
  { month: '2027-03', demand: 205, capacity: 200 },
  { month: '2027-04', demand: 198, capacity: 200 },
  { month: '2027-05', demand: 255, capacity: 260 },
  { month: '2027-06', demand: 261, capacity: 260 },
  { month: '2027-07', demand: 240, capacity: 260 },
  { month: '2027-08', demand: 300, capacity: 260 },
  { month: '2027-09', demand: 280, capacity: 300 },
  { month: '2027-10', demand: 310, capacity: 300 },
  { month: '2027-11', demand: 295, capacity: 300 },
  { month: '2027-12', demand: 330, capacity: 300 },
];
