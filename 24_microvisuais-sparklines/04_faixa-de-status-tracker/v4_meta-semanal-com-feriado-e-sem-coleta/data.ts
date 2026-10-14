/**
 * Agendas marcadas por semana na pré-venda, 23 semanas seguidas de segunda a domingo, da semana de
 * 2026-04-27 à de 2026-09-28. `agendas: null` é semana sem coleta: não é zero e fica fora da conta.
 * `holiday` marca a semana do feriado de 2026-09-07, que também fica fora da conta. A 18ª semana está
 * exatamente na meta, para provar que atingir o limite conta como bater. Dado fictício e fixo.
 */
export interface WeekReading {
  readonly agendas: number | null;
  readonly holiday: boolean;
}

/** Segunda-feira da primeira semana; as demais seguem de sete em sete dias. */
export const FIRST_WEEK = '2026-04-27';

/** Meta semanal de agendas marcadas. */
export const WEEKLY_TARGET = 40;

const week = (agendas: number | null, holiday = false): WeekReading => ({ agendas, holiday });

export const data: readonly WeekReading[] = [
  week(46), week(52), week(44), week(49), week(41), week(47),
  week(33),
  week(45), week(43), week(48),
  week(null), week(null), week(null),
  week(36),
  week(42), week(50), week(45), week(40),
  week(31),
  week(22, true),
  week(44),
  week(38), week(35),
];
