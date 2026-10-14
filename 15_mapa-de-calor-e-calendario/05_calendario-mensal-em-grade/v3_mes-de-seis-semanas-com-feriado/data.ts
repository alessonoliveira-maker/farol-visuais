/**
 * Agendas marcadas por dia em novembro de 2026, em contagem de agendas. Dado fictício e fixo: uma
 * entrada por dia do mês, na ordem, do dia 1 ao dia 30.
 *
 * O mês foi escolhido porque ele obriga o desenho a existir: nov/26 começa num domingo e termina numa
 * segunda, então as semanas de segunda a domingo que o contêm são SEIS, e um calendário de cinco
 * linhas perderia o dia 1 ou o dia 30. O deslocamento sai do dia 1, calculado no componente.
 *
 * Quatro coisas diferentes convivem aqui, e o desenho não pode fundi-las: dia com agenda, dia útil que
 * terminou em zero, que é medição, dia sem expediente, que é fim de semana ou feriado e sai de toda
 * média, e dia que ainda não aconteceu. O dia 19 é o zero medido, o dia 20 é o feriado, e do dia 25 em
 * diante o mês ainda não foi medido, porque o recorte para no dia 24.
 */

/** Mês desenhado, em `YYYY-MM`. A grade sai daqui, nunca do relógio da máquina. */
export const MONTH = '2026-11';

/** Último dia com medição, em `YYYY-MM-DD`. Daqui em diante o mês é futuro. */
export const MEASURED_THROUGH = '2026-11-24';

export interface DayAgenda {
  /** Dia do mês, de 1 ao último. */
  readonly day: number;
  /** Agendas marcadas. Null é dia sem expediente ou dia ainda não medido. */
  readonly agendas: number | null;
  /** Verdadeiro no dia sem expediente por feriado, que não é fim de semana nem futuro. */
  readonly holiday?: boolean;
}

export const data: readonly DayAgenda[] = [
  { day: 1, agendas: null },
  { day: 2, agendas: 14 },
  { day: 3, agendas: 17 },
  { day: 4, agendas: 12 },
  { day: 5, agendas: 15 },
  { day: 6, agendas: 8 },
  { day: 7, agendas: null },
  { day: 8, agendas: null },
  { day: 9, agendas: 19 },
  { day: 10, agendas: 21 },
  { day: 11, agendas: 16 },
  { day: 12, agendas: 13 },
  { day: 13, agendas: 6 },
  { day: 14, agendas: null },
  { day: 15, agendas: null },
  { day: 16, agendas: 18 },
  { day: 17, agendas: 20 },
  { day: 18, agendas: 11 },
  { day: 19, agendas: 0 },
  { day: 20, agendas: null, holiday: true },
  { day: 21, agendas: null },
  { day: 22, agendas: null },
  { day: 23, agendas: 24 },
  { day: 24, agendas: 19 },
  { day: 25, agendas: null },
  { day: 26, agendas: null },
  { day: 27, agendas: null },
  { day: 28, agendas: null },
  { day: 29, agendas: null },
  { day: 30, agendas: null },
];
