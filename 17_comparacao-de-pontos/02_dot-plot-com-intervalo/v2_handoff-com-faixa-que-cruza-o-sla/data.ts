/**
 * Tempo de aceite do handoff por executivo no mês, em dias corridos: mediana, primeiro e terceiro
 * quartil (interpolação linear) e o número de handoffs medidos. Dado fictício e fixo. Quatro faixas
 * atravessam o SLA de 2 dias (Caio M. e Débora F. com a mediana já acima dele) e três ficam
 * inteiras abaixo; o nome mais longo (Ana Beatriz Cavalcanti) testa a coluna de nomes.
 */
export interface HandoffAcceptance {
  readonly id: string;
  readonly name: string;
  readonly handoffs: number;
  readonly median: number;
  readonly q1: number;
  readonly q3: number;
}

/** SLA de aceite do handoff, em dias. */
export const SLA_DAYS = 2;

export const data: readonly HandoffAcceptance[] = [
  { id: 'exec-01', name: 'Talita V.', handoffs: 22, median: 0.8, q1: 0.4, q3: 1.3 },
  { id: 'exec-02', name: 'Murilo C.', handoffs: 31, median: 1.1, q1: 0.6, q3: 1.7 },
  { id: 'exec-03', name: 'Renan A.', handoffs: 18, median: 1.6, q1: 0.9, q3: 2.6 },
  { id: 'exec-04', name: 'Ana Beatriz Cavalcanti', handoffs: 14, median: 1.9, q1: 1.2, q3: 3.1 },
  { id: 'exec-05', name: 'Caio M.', handoffs: 26, median: 2.4, q1: 1.5, q3: 3.8 },
  { id: 'exec-06', name: 'Débora F.', handoffs: 9, median: 2.9, q1: 1.7, q3: 3.4 },
  { id: 'exec-07', name: 'Heitor L.', handoffs: 29, median: 0.5, q1: 0.2, q3: 0.9 },
];
