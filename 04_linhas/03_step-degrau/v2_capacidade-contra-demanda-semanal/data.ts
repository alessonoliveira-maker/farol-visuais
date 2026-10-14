/**
 * Demanda semanal de entradas da pré-vendas, em contagem, de 2026-01-05 a 2026-05-18, contra o
 * teto de capacidade em degrau da mesma equipe fictícia (nunca pessoa ou empresa real). O teto
 * vale a partir da data da mudança (stepAfter): sobe com contratações e cai com a saída de
 * 2026-05-04.
 */
export interface WeeklyDemand {
  readonly week: string;
  readonly demand: number;
}

export const data: readonly WeeklyDemand[] = [
  { week: '2026-01-05', demand: 9 },
  { week: '2026-01-12', demand: 10 },
  { week: '2026-01-19', demand: 8 },
  { week: '2026-01-26', demand: 9 },
  { week: '2026-02-02', demand: 11 },
  { week: '2026-02-09', demand: 9 },
  { week: '2026-02-16', demand: 10 },
  { week: '2026-02-23', demand: 9 },
  { week: '2026-03-02', demand: 14 },
  { week: '2026-03-09', demand: 15 },
  { week: '2026-03-16', demand: 13 },
  { week: '2026-03-23', demand: 16 },
  { week: '2026-03-30', demand: 14 },
  { week: '2026-04-06', demand: 15 },
  { week: '2026-04-13', demand: 13 },
  { week: '2026-04-20', demand: 14 },
  { week: '2026-04-27', demand: 15 },
  { week: '2026-05-04', demand: 14 },
  { week: '2026-05-11', demand: 15 },
  { week: '2026-05-18', demand: 16 },
];

export interface CapacityStep {
  readonly date: string;
  readonly value: number;
}

/** Teto de capacidade da pré-vendas: sobe com contratações e cai com a saída de 2026-05-04. */
export const capacitySteps: readonly CapacityStep[] = [
  { date: '2026-01-05', value: 10 },
  { date: '2026-03-02', value: 15 },
  { date: '2026-05-04', value: 12 },
];
