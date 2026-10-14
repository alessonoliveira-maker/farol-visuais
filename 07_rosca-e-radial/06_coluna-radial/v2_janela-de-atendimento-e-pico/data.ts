/**
 * Entradas da fila de pré-vendas por hora do dia, em 2026-08-01. Dado fictício e fixo.
 * A janela de atendimento vai das 9h às 18h; fora dela a fila espera até a manhã seguinte.
 */
export interface HourlyEntries {
  readonly hour: number;
  readonly count: number;
}

export const data: readonly HourlyEntries[] = [
  { hour: 0, count: 9 },
  { hour: 1, count: 8 },
  { hour: 2, count: 5 },
  { hour: 3, count: 4 },
  { hour: 4, count: 4 },
  { hour: 5, count: 6 },
  { hour: 6, count: 14 },
  { hour: 7, count: 34 },
  { hour: 8, count: 90 },
  { hour: 9, count: 130 },
  { hour: 10, count: 163 },
  { hour: 11, count: 185 },
  { hour: 12, count: 158 },
  { hour: 13, count: 151 },
  { hour: 14, count: 170 },
  { hour: 15, count: 161 },
  { hour: 16, count: 153 },
  { hour: 17, count: 131 },
  { hour: 18, count: 104 },
  { hour: 19, count: 64 },
  { hour: 20, count: 41 },
  { hour: 21, count: 27 },
  { hour: 22, count: 18 },
  { hour: 23, count: 12 },
];

/** Data do recorte, para a frase acessível e a linha de leitura. */
export const referenceDate = '2026-08-01';

/** Janela de atendimento: da hora de início (inclusive) até a hora de fim (exclusive). */
export const windowStartHour = 9;
export const windowEndHour = 18;
