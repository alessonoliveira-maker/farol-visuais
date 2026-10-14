/**
 * Entradas semanais na pré-vendas, em 26 semanas corridas. Contagem de oportunidades, unidade
 * "entradas". Dado fictício e fixo: nenhuma pessoa ou campanha real é citada.
 */
export interface WeeklyIntake {
  readonly week: string;
  readonly weekStart: string;
  readonly month: string;
  readonly entradas: number;
}

export const data: readonly WeeklyIntake[] = [
  { week: 'S01', weekStart: '2026-03-23', month: '2026-03', entradas: 58 },
  { week: 'S02', weekStart: '2026-03-30', month: '2026-03', entradas: 61 },
  { week: 'S03', weekStart: '2026-04-06', month: '2026-04', entradas: 64 },
  { week: 'S04', weekStart: '2026-04-13', month: '2026-04', entradas: 59 },
  { week: 'S05', weekStart: '2026-04-20', month: '2026-04', entradas: 67 },
  { week: 'S06', weekStart: '2026-04-27', month: '2026-04', entradas: 71 },
  { week: 'S07', weekStart: '2026-05-04', month: '2026-05', entradas: 69 },
  { week: 'S08', weekStart: '2026-05-11', month: '2026-05', entradas: 74 },
  { week: 'S09', weekStart: '2026-05-18', month: '2026-05', entradas: 78 },
  { week: 'S10', weekStart: '2026-05-25', month: '2026-05', entradas: 73 },
  { week: 'S11', weekStart: '2026-06-01', month: '2026-06', entradas: 81 },
  { week: 'S12', weekStart: '2026-06-08', month: '2026-06', entradas: 84 },
  { week: 'S13', weekStart: '2026-06-15', month: '2026-06', entradas: 79 },
  { week: 'S14', weekStart: '2026-06-22', month: '2026-06', entradas: 88 },
  { week: 'S15', weekStart: '2026-06-29', month: '2026-06', entradas: 92 },
  { week: 'S16', weekStart: '2026-07-06', month: '2026-07', entradas: 86 },
  { week: 'S17', weekStart: '2026-07-13', month: '2026-07', entradas: 90 },
  { week: 'S18', weekStart: '2026-07-20', month: '2026-07', entradas: 95 },
  { week: 'S19', weekStart: '2026-07-27', month: '2026-07', entradas: 91 },
  { week: 'S20', weekStart: '2026-08-03', month: '2026-08', entradas: 97 },
  { week: 'S21', weekStart: '2026-08-10', month: '2026-08', entradas: 101 },
  { week: 'S22', weekStart: '2026-08-17', month: '2026-08', entradas: 96 },
  { week: 'S23', weekStart: '2026-08-24', month: '2026-08', entradas: 103 },
  { week: 'S24', weekStart: '2026-08-31', month: '2026-08', entradas: 108 },
  { week: 'S25', weekStart: '2026-09-07', month: '2026-09', entradas: 99 },
  { week: 'S26', weekStart: '2026-09-14', month: '2026-09', entradas: 62 },
];

/** Semana corrente, ainda em curso: a última do recorte fica marcada como parcial. */
export const currentWeek = 'S26';
