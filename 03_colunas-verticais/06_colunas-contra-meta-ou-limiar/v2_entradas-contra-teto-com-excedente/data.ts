/**
 * Entradas semanais na fila de pré-vendas, em contagem de oportunidades, contra o teto de
 * capacidade semanal da equipe. Dado fictício e fixo: nenhuma pessoa ou empresa real.
 */
export interface WeeklyIntake {
  readonly week: string;
  readonly intake: number;
}

export const data: readonly WeeklyIntake[] = [
  { week: 'S01', intake: 50 },
  { week: 'S02', intake: 58 },
  { week: 'S03', intake: 63 },
  { week: 'S04', intake: 60 },
  { week: 'S05', intake: 71 },
  { week: 'S06', intake: 45 },
  { week: 'S07', intake: 55 },
  { week: 'S08', intake: 82 },
  { week: 'S09', intake: 59 },
  { week: 'S10', intake: 66 },
];

/** Teto de capacidade semanal fixo da equipe no período. */
export const cap = 60;
