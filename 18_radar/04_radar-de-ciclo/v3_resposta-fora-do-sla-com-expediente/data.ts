/**
 * Primeiras respostas da pré-vendas por hora do dia em 2026-08: quantas foram dadas naquela hora do
 * dia no mês e quantas passaram do SLA. A hora 0 começa à meia-noite e o ciclo fecha na hora 23. A
 * hora 3 não teve nenhuma resposta (total 0), uma ausência, e a hora 4 tem volume pequeno e nenhum estouro, um zero medido. Dado fictício e fixo.
 */
export interface SlaHour {
  readonly id: string;
  /** Hora do dia de 0 a 23, a posição no ciclo. */
  readonly hour: number;
  /** Primeiras respostas dadas nessa hora, somadas no mês. */
  readonly total: number;
  /** Quantas delas passaram do SLA. */
  readonly breaches: number;
}

export const data: readonly SlaHour[] = [
  { id: 'h00', hour: 0, total: 38, breaches: 21 },
  { id: 'h01', hour: 1, total: 22, breaches: 11 },
  { id: 'h02', hour: 2, total: 14, breaches: 7 },
  { id: 'h03', hour: 3, total: 0, breaches: 0 },
  { id: 'h04', hour: 4, total: 7, breaches: 0 },
  { id: 'h05', hour: 5, total: 12, breaches: 5 },
  { id: 'h06', hour: 6, total: 31, breaches: 12 },
  { id: 'h07', hour: 7, total: 78, breaches: 28 },
  { id: 'h08', hour: 8, total: 164, breaches: 10 },
  { id: 'h09', hour: 9, total: 231, breaches: 12 },
  { id: 'h10', hour: 10, total: 262, breaches: 13 },
  { id: 'h11', hour: 11, total: 248, breaches: 11 },
  { id: 'h12', hour: 12, total: 176, breaches: 8 },
  { id: 'h13', hour: 13, total: 241, breaches: 14 },
  { id: 'h14', hour: 14, total: 285, breaches: 16 },
  { id: 'h15', hour: 15, total: 270, breaches: 13 },
  { id: 'h16', hour: 16, total: 238, breaches: 10 },
  { id: 'h17', hour: 17, total: 189, breaches: 8 },
  { id: 'h18', hour: 18, total: 121, breaches: 46 },
  { id: 'h19', hour: 19, total: 96, breaches: 37 },
  { id: 'h20', hour: 20, total: 84, breaches: 34 },
  { id: 'h21', hour: 21, total: 77, breaches: 31 },
  { id: 'h22', hour: 22, total: 61, breaches: 25 },
  { id: 'h23', hour: 23, total: 47, breaches: 19 },
];

/** O mês do dado, no formato do dado. */
export const month = '2026-08';

/** O expediente da pré-vendas: das 8h, inclusive, até as 18h, exclusive. */
export const officeStart = 8;
export const officeEnd = 18;
