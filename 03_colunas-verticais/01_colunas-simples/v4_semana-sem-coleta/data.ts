/**
 * Entradas semanais na pré-vendas, em 14 semanas corridas. Contagem de oportunidades, unidade
 * "entradas". `null` é semana sem coleta (falha do formulário), não semana zerada. Dado fictício
 * e fixo: nenhuma pessoa ou campanha real é citada.
 */
export interface WeeklyIntakeMaybe {
  readonly week: string;
  readonly weekStart: string;
  readonly entradas: number | null;
}

export const data: readonly WeeklyIntakeMaybe[] = [
  { week: 'S01', weekStart: '2026-06-08', entradas: 41 },
  { week: 'S02', weekStart: '2026-06-15', entradas: 47 },
  { week: 'S03', weekStart: '2026-06-22', entradas: 38 },
  { week: 'S04', weekStart: '2026-06-29', entradas: 52 },
  { week: 'S05', weekStart: '2026-07-06', entradas: 49 },
  { week: 'S06', weekStart: '2026-07-13', entradas: null },
  { week: 'S07', weekStart: '2026-07-20', entradas: 55 },
  { week: 'S08', weekStart: '2026-07-27', entradas: 58 },
  { week: 'S09', weekStart: '2026-08-03', entradas: 44 },
  { week: 'S10', weekStart: '2026-08-10', entradas: 0 },
  { week: 'S11', weekStart: '2026-08-17', entradas: 51 },
  { week: 'S12', weekStart: '2026-08-24', entradas: 60 },
  { week: 'S13', weekStart: '2026-08-31', entradas: 53 },
  { week: 'S14', weekStart: '2026-09-07', entradas: 57 },
];
