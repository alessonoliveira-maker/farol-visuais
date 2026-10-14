/**
 * Percentual semanal de leads atendidos dentro do SLA, em fração de 0 a 1, de maio a julho de
 * 2026. Dado fictício e fixo: nenhuma empresa ou pessoa real. A troca de escala da pré-vendas
 * em 2026-06-15 antecede a queda sustentada abaixo da meta.
 */
export interface WeeklySla {
  readonly week: string;
  readonly pctInSla: number;
}

export const data: readonly WeeklySla[] = [
  { week: '2026-05-04', pctInSla: 0.91 },
  { week: '2026-05-11', pctInSla: 0.93 },
  { week: '2026-05-18', pctInSla: 0.89 },
  { week: '2026-05-25', pctInSla: 0.92 },
  { week: '2026-06-01', pctInSla: 0.9 },
  { week: '2026-06-08', pctInSla: 0.88 },
  { week: '2026-06-15', pctInSla: 0.84 },
  { week: '2026-06-22', pctInSla: 0.81 },
  { week: '2026-06-29', pctInSla: 0.78 },
  { week: '2026-07-06', pctInSla: 0.83 },
  { week: '2026-07-13', pctInSla: 0.8 },
  { week: '2026-07-20', pctInSla: 0.76 },
];

/** Meta de atendimento no SLA da operação. */
export const target = 0.9;
/** Semana da mudança de escala da equipe de pré-vendas. */
export const eventWeek = '2026-06-15';
export const eventLabel = 'Troca de escala';
