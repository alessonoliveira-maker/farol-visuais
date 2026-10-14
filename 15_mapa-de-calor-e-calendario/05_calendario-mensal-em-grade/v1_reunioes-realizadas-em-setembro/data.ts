/**
 * Reuniões realizadas por dia em setembro de 2026. Dado fictício e fixo: uma entrada por dia do mês,
 * na ordem, com a contagem de reuniões que aconteceram de fato, não as agendadas. Zero em dia útil é
 * medição, e o feriado do dia 7 é a única célula que não é nem medição nem ausência: é dia sem
 * expediente, e por isso aparece marcado por ícone e não por cor.
 */

/** Mês desenhado, em `YYYY-MM`. A grade sai daqui, não do relógio da máquina. */
export const MONTH = '2026-09';

export interface DayCell {
  /** Dia do mês, de 1 ao último. */
  readonly day: number;
  /** Reuniões realizadas. Null é dia sem expediente, que não entra em nenhuma média. */
  readonly meetings: number | null;
  /** Nome do feriado, quando houver. */
  readonly holiday?: string;
}

export const data: readonly DayCell[] = [
  { day: 1, meetings: 9 },
  { day: 2, meetings: 12 },
  { day: 3, meetings: 11 },
  { day: 4, meetings: 7 },
  { day: 5, meetings: 0 },
  { day: 6, meetings: 0 },
  { day: 7, meetings: null, holiday: 'feriado nacional' },
  { day: 8, meetings: 14 },
  { day: 9, meetings: 13 },
  { day: 10, meetings: 10 },
  { day: 11, meetings: 8 },
  { day: 12, meetings: 1 },
  { day: 13, meetings: 0 },
  { day: 14, meetings: 11 },
  { day: 15, meetings: 15 },
  { day: 16, meetings: 12 },
  { day: 17, meetings: 9 },
  { day: 18, meetings: 6 },
  { day: 19, meetings: 0 },
  { day: 20, meetings: 0 },
  { day: 21, meetings: 13 },
  { day: 22, meetings: 16 },
  { day: 23, meetings: 14 },
  { day: 24, meetings: 12 },
  { day: 25, meetings: 9 },
  { day: 26, meetings: 0 },
  { day: 27, meetings: 0 },
  { day: 28, meetings: 12 },
  { day: 29, meetings: 17 },
  { day: 30, meetings: 15 },
];
