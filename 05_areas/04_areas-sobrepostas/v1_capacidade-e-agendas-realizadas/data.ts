/**
 * Capacidade semanal de agendas da pré-vendas (envelope) e agendas realizadas (parte), contagem
 * de reuniões, 37 semanas de 2026-01-05 a 2026-09-14. A capacidade sobe em três degraus por
 * contratação (40 até março, 48 de abril a junho, 52 em julho e agosto, 58 a partir de setembro);
 * o realizado nunca passa a capacidade da própria semana. Dado fictício e fixo.
 */
export interface WeeklyScheduleCapacity {
  readonly week: string;
  readonly capacity: number;
  readonly held: number;
}

export const data: readonly WeeklyScheduleCapacity[] = [
  { week: '2026-01-05', capacity: 40, held: 31 },
  { week: '2026-01-12', capacity: 40, held: 33 },
  { week: '2026-01-19', capacity: 40, held: 34 },
  { week: '2026-01-26', capacity: 40, held: 28 },
  { week: '2026-02-02', capacity: 40, held: 32 },
  { week: '2026-02-09', capacity: 40, held: 33 },
  { week: '2026-02-16', capacity: 40, held: 34 },
  { week: '2026-02-23', capacity: 40, held: 30 },
  { week: '2026-03-02', capacity: 40, held: 24 },
  { week: '2026-03-09', capacity: 40, held: 29 },
  { week: '2026-03-16', capacity: 40, held: 35 },
  { week: '2026-03-23', capacity: 40, held: 36 },
  { week: '2026-03-30', capacity: 40, held: 26 },
  { week: '2026-04-06', capacity: 48, held: 38 },
  { week: '2026-04-13', capacity: 48, held: 40 },
  { week: '2026-04-20', capacity: 48, held: 42 },
  { week: '2026-04-27', capacity: 48, held: 38 },
  { week: '2026-05-04', capacity: 48, held: 39 },
  { week: '2026-05-11', capacity: 48, held: 41 },
  { week: '2026-05-18', capacity: 48, held: 43 },
  { week: '2026-05-25', capacity: 48, held: 37 },
  { week: '2026-06-01', capacity: 48, held: 39 },
  { week: '2026-06-08', capacity: 48, held: 41 },
  { week: '2026-06-15', capacity: 48, held: 43 },
  { week: '2026-06-22', capacity: 48, held: 40 },
  { week: '2026-06-29', capacity: 48, held: 36 },
  { week: '2026-07-06', capacity: 52, held: 44 },
  { week: '2026-07-13', capacity: 52, held: 46 },
  { week: '2026-07-20', capacity: 52, held: 47 },
  { week: '2026-07-27', capacity: 52, held: 42 },
  { week: '2026-08-03', capacity: 52, held: 43 },
  { week: '2026-08-10', capacity: 52, held: 45 },
  { week: '2026-08-17', capacity: 52, held: 47 },
  { week: '2026-08-24', capacity: 52, held: 49 },
  { week: '2026-08-31', capacity: 52, held: 41 },
  { week: '2026-09-07', capacity: 58, held: 50 },
  { week: '2026-09-14', capacity: 58, held: 52 },
];
