/**
 * Entradas de lead da pré-vendas por hora do dia em 2026-08, somadas nos 31 dias do mês. A hora 0
 * é a que começa à meia-noite e o ciclo fecha na hora 23. Dado fictício e fixo.
 */
export interface HourEntry {
  readonly id: string;
  /** Hora do dia de 0 a 23, a posição no ciclo. */
  readonly hour: number;
  /** Entradas de lead nessa hora, somadas no mês. */
  readonly total: number;
}

export const data: readonly HourEntry[] = [
  { id: 'h00', hour: 0, total: 38 },
  { id: 'h01', hour: 1, total: 22 },
  { id: 'h02', hour: 2, total: 14 },
  { id: 'h03', hour: 3, total: 9 },
  { id: 'h04', hour: 4, total: 7 },
  { id: 'h05', hour: 5, total: 12 },
  { id: 'h06', hour: 6, total: 31 },
  { id: 'h07', hour: 7, total: 78 },
  { id: 'h08', hour: 8, total: 164 },
  { id: 'h09', hour: 9, total: 231 },
  { id: 'h10', hour: 10, total: 262 },
  { id: 'h11', hour: 11, total: 248 },
  { id: 'h12', hour: 12, total: 176 },
  { id: 'h13', hour: 13, total: 241 },
  { id: 'h14', hour: 14, total: 285 },
  { id: 'h15', hour: 15, total: 270 },
  { id: 'h16', hour: 16, total: 238 },
  { id: 'h17', hour: 17, total: 189 },
  { id: 'h18', hour: 18, total: 121 },
  { id: 'h19', hour: 19, total: 96 },
  { id: 'h20', hour: 20, total: 84 },
  { id: 'h21', hour: 21, total: 77 },
  { id: 'h22', hour: 22, total: 61 },
  { id: 'h23', hour: 23, total: 47 },
];

/** O mês do dado, no formato do dado. */
export const month = '2026-08';

/** Dias do mês: a base da média por hora. */
export const daysInMonth = 31;
