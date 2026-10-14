/**
 * Movimento semanal do funil de pré-vendas em 13 semanas: entradas por novas oportunidades e
 * reativadas, saídas por perdidas e desqualificadas. Contagem de oportunidades, unidade
 * "oportunidades". A semana de 2026-07-27 não teve entrada nenhuma, só saída (caso difícil de
 * "sem entradas na semana"). Dado fictício e fixo: nenhuma pessoa ou empresa real é citada.
 */
export interface WeeklyFunnelMovement {
  readonly week: string;
  readonly weekStart: string;
  readonly novas: number;
  readonly reativadas: number;
  readonly perdidas: number;
  readonly desqualificadas: number;
}

export const data: readonly WeeklyFunnelMovement[] = [
  { week: 'S01', weekStart: '2026-06-22', novas: 54, reativadas: 6, perdidas: 22, desqualificadas: 9 },
  { week: 'S02', weekStart: '2026-06-29', novas: 58, reativadas: 5, perdidas: 25, desqualificadas: 11 },
  { week: 'S03', weekStart: '2026-07-06', novas: 61, reativadas: 7, perdidas: 20, desqualificadas: 8 },
  { week: 'S04', weekStart: '2026-07-13', novas: 57, reativadas: 4, perdidas: 30, desqualificadas: 14 },
  { week: 'S05', weekStart: '2026-07-20', novas: 63, reativadas: 8, perdidas: 24, desqualificadas: 10 },
  { week: 'S06', weekStart: '2026-07-27', novas: 0, reativadas: 0, perdidas: 18, desqualificadas: 12 },
  { week: 'S07', weekStart: '2026-08-03', novas: 66, reativadas: 9, perdidas: 21, desqualificadas: 9 },
  { week: 'S08', weekStart: '2026-08-10', novas: 70, reativadas: 6, perdidas: 19, desqualificadas: 7 },
  { week: 'S09', weekStart: '2026-08-17', novas: 64, reativadas: 8, perdidas: 26, desqualificadas: 13 },
  { week: 'S10', weekStart: '2026-08-24', novas: 59, reativadas: 5, perdidas: 28, desqualificadas: 15 },
  { week: 'S11', weekStart: '2026-08-31', novas: 68, reativadas: 10, perdidas: 22, desqualificadas: 8 },
  { week: 'S12', weekStart: '2026-09-07', novas: 72, reativadas: 7, perdidas: 20, desqualificadas: 9 },
  { week: 'S13', weekStart: '2026-09-14', novas: 61, reativadas: 6, perdidas: 24, desqualificadas: 11 },
];
