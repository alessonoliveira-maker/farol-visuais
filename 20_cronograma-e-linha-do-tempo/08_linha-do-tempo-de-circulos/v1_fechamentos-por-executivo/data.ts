/**
 * Fechamentos de contratos por executivo no terceiro trimestre de 2026 (2026-07-01 a 2026-09-30).
 * Cada linha é um fechamento: a data do dia e o valor em reais. Dado fictício e fixo: nenhum nome é
 * pessoa real. O dado exercita o caso difícil de propósito: fechamentos do mesmo executivo a um dia
 * um do outro (círculos que se sobrepõem), um fechamento de valor pequeno ao lado de um de valor
 * grande e um executivo com poucos fechamentos.
 */
export interface Closing {
  readonly id: string;
  readonly executive: string;
  /** Data do fechamento, `YYYY-MM-DD`. */
  readonly date: string;
  /** Valor fechado, em reais. */
  readonly value: number;
}

export const data: readonly Closing[] = [
  { id: 'c-01', executive: 'Executivo 01', date: '2026-07-03', value: 42_000 },
  { id: 'c-02', executive: 'Executivo 01', date: '2026-07-21', value: 68_500 },
  { id: 'c-03', executive: 'Executivo 01', date: '2026-08-06', value: 23_800 },
  { id: 'c-04', executive: 'Executivo 01', date: '2026-08-27', value: 91_000 },
  { id: 'c-05', executive: 'Executivo 01', date: '2026-09-15', value: 57_200 },
  { id: 'c-06', executive: 'Executivo 02', date: '2026-07-08', value: 31_400 },
  { id: 'c-07', executive: 'Executivo 02', date: '2026-07-30', value: 15_600 },
  { id: 'c-08', executive: 'Executivo 02', date: '2026-08-12', value: 74_000 },
  { id: 'c-09', executive: 'Executivo 02', date: '2026-08-13', value: 9_800 },
  { id: 'c-10', executive: 'Executivo 02', date: '2026-09-02', value: 48_300 },
  { id: 'c-11', executive: 'Executivo 02', date: '2026-09-24', value: 26_900 },
  { id: 'c-12', executive: 'Executivo 03', date: '2026-07-14', value: 118_000 },
  { id: 'c-13', executive: 'Executivo 03', date: '2026-07-15', value: 36_500 },
  { id: 'c-14', executive: 'Executivo 03', date: '2026-08-04', value: 186_000 },
  { id: 'c-15', executive: 'Executivo 03', date: '2026-08-19', value: 52_700 },
  { id: 'c-16', executive: 'Executivo 03', date: '2026-09-08', value: 134_400 },
  { id: 'c-17', executive: 'Executivo 03', date: '2026-09-29', value: 79_000 },
  { id: 'c-18', executive: 'Executivo 04', date: '2026-07-06', value: 19_200 },
  { id: 'c-19', executive: 'Executivo 04', date: '2026-07-07', value: 27_400 },
  { id: 'c-20', executive: 'Executivo 04', date: '2026-07-09', value: 33_100 },
  { id: 'c-21', executive: 'Executivo 04', date: '2026-07-28', value: 61_800 },
  { id: 'c-22', executive: 'Executivo 04', date: '2026-08-21', value: 45_000 },
  { id: 'c-23', executive: 'Executivo 04', date: '2026-09-10', value: 22_500 },
  { id: 'c-24', executive: 'Executivo 04', date: '2026-09-18', value: 38_700 },
  { id: 'c-25', executive: 'Executivo 05', date: '2026-08-10', value: 12_300 },
  { id: 'c-26', executive: 'Executivo 05', date: '2026-09-04', value: 29_600 },
  { id: 'c-27', executive: 'Executivo 05', date: '2026-09-22', value: 16_400 },
];
