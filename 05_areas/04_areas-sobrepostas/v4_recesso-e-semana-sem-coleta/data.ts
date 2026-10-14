/**
 * Capacidade semanal de agendas da pré-vendas (envelope) e agendas realizadas (parte), contagem
 * de reuniões, 12 semanas de 2026-06-01 a 2026-08-17. Em 2026-07-06 a equipe entrou em recesso
 * coletivo: capacidade e realizado são zero medido, não ausência. Em 2026-07-27 o sistema de
 * apontamento falhou e o realizado não foi coletado: `held` vem `null`, enquanto a capacidade
 * daquela semana continua normal. Dado fictício e fixo.
 */
export interface WeeklyScheduleGap {
  readonly week: string;
  readonly capacity: number;
  readonly held: number | null;
}

export const data: readonly WeeklyScheduleGap[] = [
  { week: '2026-06-01', capacity: 40, held: 34 },
  { week: '2026-06-08', capacity: 40, held: 36 },
  { week: '2026-06-15', capacity: 40, held: 31 },
  { week: '2026-06-22', capacity: 40, held: 33 },
  { week: '2026-06-29', capacity: 40, held: 30 },
  { week: '2026-07-06', capacity: 0, held: 0 },
  { week: '2026-07-13', capacity: 40, held: 32 },
  { week: '2026-07-20', capacity: 40, held: 35 },
  { week: '2026-07-27', capacity: 40, held: null },
  { week: '2026-08-03', capacity: 40, held: 33 },
  { week: '2026-08-10', capacity: 40, held: 36 },
  { week: '2026-08-17', capacity: 40, held: 34 },
];
