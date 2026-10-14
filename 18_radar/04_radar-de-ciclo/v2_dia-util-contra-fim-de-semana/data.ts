/**
 * Entradas de lead da pré-vendas por hora do dia em 2026-08, somadas separadamente nos 21 dias
 * úteis e nos 10 dias de fim de semana do mês. A hora 0 começa à meia-noite e o ciclo fecha na
 * hora 23. Dado fictício e fixo.
 */
export interface HourRegime {
  readonly id: string;
  /** Hora do dia de 0 a 23, a posição no ciclo. */
  readonly hour: number;
  /** Entradas nessa hora, somadas nos dias úteis do mês. */
  readonly weekdayTotal: number;
  /** Entradas nessa hora, somadas nos sábados e domingos do mês. */
  readonly weekendTotal: number;
}

export const data: readonly HourRegime[] = [
  { id: 'h00', hour: 0, weekdayTotal: 15, weekendTotal: 21 },
  { id: 'h01', hour: 1, weekdayTotal: 7, weekendTotal: 14 },
  { id: 'h02', hour: 2, weekdayTotal: 5, weekendTotal: 8 },
  { id: 'h03', hour: 3, weekdayTotal: 4, weekendTotal: 4 },
  { id: 'h04', hour: 4, weekdayTotal: 4, weekendTotal: 2 },
  { id: 'h05', hour: 5, weekdayTotal: 9, weekendTotal: 2 },
  { id: 'h06', hour: 6, weekdayTotal: 22, weekendTotal: 3 },
  { id: 'h07', hour: 7, weekdayTotal: 59, weekendTotal: 5 },
  { id: 'h08', hour: 8, weekdayTotal: 132, weekendTotal: 9 },
  { id: 'h09', hour: 9, weekdayTotal: 184, weekendTotal: 12 },
  { id: 'h10', hour: 10, weekdayTotal: 196, weekendTotal: 14 },
  { id: 'h11', hour: 11, weekdayTotal: 190, weekendTotal: 13 },
  { id: 'h12', hour: 12, weekdayTotal: 138, weekendTotal: 11 },
  { id: 'h13', hour: 13, weekdayTotal: 192, weekendTotal: 12 },
  { id: 'h14', hour: 14, weekdayTotal: 202, weekendTotal: 13 },
  { id: 'h15', hour: 15, weekdayTotal: 193, weekendTotal: 12 },
  { id: 'h16', hour: 16, weekdayTotal: 178, weekendTotal: 11 },
  { id: 'h17', hour: 17, weekdayTotal: 138, weekendTotal: 10 },
  { id: 'h18', hour: 18, weekdayTotal: 86, weekendTotal: 12 },
  { id: 'h19', hour: 19, weekdayTotal: 61, weekendTotal: 16 },
  { id: 'h20', hour: 20, weekdayTotal: 52, weekendTotal: 22 },
  { id: 'h21', hour: 21, weekdayTotal: 31, weekendTotal: 41 },
  { id: 'h22', hour: 22, weekdayTotal: 24, weekendTotal: 46 },
  { id: 'h23', hour: 23, weekdayTotal: 19, weekendTotal: 33 },
];

/** O mês do dado, no formato do dado. */
export const month = '2026-08';

/** Dias úteis e dias de fim de semana do mês: a base de cada média por hora. */
export const weekdayCount = 21;
export const weekendCount = 10;
