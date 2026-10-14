/**
 * Capacidade semanal de triagem de leads da pré-vendas (área, em degrau por contratação: 60 até
 * junho, 70 a partir de julho) contra a demanda de entradas de leads (linha), contagem de leads,
 * 16 semanas de 2026-05-04 a 2026-08-17. Dado fictício e fixo.
 */
export interface WeeklyLeadDemand {
  readonly week: string;
  readonly capacity: number;
  readonly demand: number;
}

export const data: readonly WeeklyLeadDemand[] = [
  { week: '2026-05-04', capacity: 60, demand: 52 },
  { week: '2026-05-11', capacity: 60, demand: 58 },
  { week: '2026-05-18', capacity: 60, demand: 59 },
  { week: '2026-05-25', capacity: 60, demand: 78 },
  { week: '2026-06-01', capacity: 60, demand: 82 },
  { week: '2026-06-08', capacity: 60, demand: 63 },
  { week: '2026-06-15', capacity: 60, demand: 54 },
  { week: '2026-06-22', capacity: 60, demand: 50 },
  { week: '2026-06-29', capacity: 60, demand: 53 },
  { week: '2026-07-06', capacity: 70, demand: 58 },
  { week: '2026-07-13', capacity: 70, demand: 63 },
  { week: '2026-07-20', capacity: 70, demand: 74 },
  { week: '2026-07-27', capacity: 70, demand: 68 },
  { week: '2026-08-03', capacity: 70, demand: 60 },
  { week: '2026-08-10', capacity: 70, demand: 55 },
  { week: '2026-08-17', capacity: 70, demand: 52 },
];
