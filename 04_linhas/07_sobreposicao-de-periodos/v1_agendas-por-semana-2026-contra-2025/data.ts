/**
 * Agendas comerciais marcadas por semana ISO, em 2025 e 2026, contagem inteira de reuniões.
 * Formato longo: uma linha por ano e semana; o pivot para colunas por ano acontece no Chart.tsx.
 * Dado fictício e fixo: 2025 tem as 52 semanas completas; 2026 só até a semana 37 (medida),
 * as semanas 38 a 52 de 2026 ainda não existem e por isso nem entram aqui.
 */
export interface WeeklyBookingRecord {
  readonly year: 2025 | 2026;
  readonly isoWeek: number;
  readonly bookings: number;
}

export const data: readonly WeeklyBookingRecord[] = [
  { year: 2025, isoWeek: 1, bookings: 22 }, { year: 2025, isoWeek: 2, bookings: 24 },
  { year: 2025, isoWeek: 3, bookings: 23 }, { year: 2025, isoWeek: 4, bookings: 25 },
  { year: 2025, isoWeek: 5, bookings: 24 }, { year: 2025, isoWeek: 6, bookings: 20 },
  { year: 2025, isoWeek: 7, bookings: 14 }, { year: 2025, isoWeek: 8, bookings: 15 },
  { year: 2025, isoWeek: 9, bookings: 21 }, { year: 2025, isoWeek: 10, bookings: 25 },
  { year: 2025, isoWeek: 11, bookings: 26 }, { year: 2025, isoWeek: 12, bookings: 27 },
  { year: 2025, isoWeek: 13, bookings: 26 }, { year: 2025, isoWeek: 14, bookings: 28 },
  { year: 2025, isoWeek: 15, bookings: 27 }, { year: 2025, isoWeek: 16, bookings: 29 },
  { year: 2025, isoWeek: 17, bookings: 28 }, { year: 2025, isoWeek: 18, bookings: 30 },
  { year: 2025, isoWeek: 19, bookings: 29 }, { year: 2025, isoWeek: 20, bookings: 31 },
  { year: 2025, isoWeek: 21, bookings: 30 }, { year: 2025, isoWeek: 22, bookings: 32 },
  { year: 2025, isoWeek: 23, bookings: 31 }, { year: 2025, isoWeek: 24, bookings: 30 },
  { year: 2025, isoWeek: 25, bookings: 29 }, { year: 2025, isoWeek: 26, bookings: 27 },
  { year: 2025, isoWeek: 27, bookings: 19 }, { year: 2025, isoWeek: 28, bookings: 17 },
  { year: 2025, isoWeek: 29, bookings: 18 }, { year: 2025, isoWeek: 30, bookings: 20 },
  { year: 2025, isoWeek: 31, bookings: 24 }, { year: 2025, isoWeek: 32, bookings: 28 },
  { year: 2025, isoWeek: 33, bookings: 30 }, { year: 2025, isoWeek: 34, bookings: 31 },
  { year: 2025, isoWeek: 35, bookings: 32 }, { year: 2025, isoWeek: 36, bookings: 33 },
  { year: 2025, isoWeek: 37, bookings: 32 }, { year: 2025, isoWeek: 38, bookings: 34 },
  { year: 2025, isoWeek: 39, bookings: 33 }, { year: 2025, isoWeek: 40, bookings: 35 },
  { year: 2025, isoWeek: 41, bookings: 34 }, { year: 2025, isoWeek: 42, bookings: 36 },
  { year: 2025, isoWeek: 43, bookings: 35 }, { year: 2025, isoWeek: 44, bookings: 37 },
  { year: 2025, isoWeek: 45, bookings: 38 }, { year: 2025, isoWeek: 46, bookings: 39 },
  { year: 2025, isoWeek: 47, bookings: 40 }, { year: 2025, isoWeek: 48, bookings: 41 },
  { year: 2025, isoWeek: 49, bookings: 40 }, { year: 2025, isoWeek: 50, bookings: 38 },
  { year: 2025, isoWeek: 51, bookings: 36 }, { year: 2025, isoWeek: 52, bookings: 14 },
  { year: 2026, isoWeek: 1, bookings: 23 }, { year: 2026, isoWeek: 2, bookings: 25 },
  { year: 2026, isoWeek: 3, bookings: 24 }, { year: 2026, isoWeek: 4, bookings: 26 },
  { year: 2026, isoWeek: 5, bookings: 25 }, { year: 2026, isoWeek: 6, bookings: 21 },
  { year: 2026, isoWeek: 7, bookings: 15 }, { year: 2026, isoWeek: 8, bookings: 16 },
  { year: 2026, isoWeek: 9, bookings: 22 }, { year: 2026, isoWeek: 10, bookings: 27 },
  { year: 2026, isoWeek: 11, bookings: 29 }, { year: 2026, isoWeek: 12, bookings: 31 },
  { year: 2026, isoWeek: 13, bookings: 31 }, { year: 2026, isoWeek: 14, bookings: 33 },
  { year: 2026, isoWeek: 15, bookings: 34 }, { year: 2026, isoWeek: 16, bookings: 36 },
  { year: 2026, isoWeek: 17, bookings: 37 }, { year: 2026, isoWeek: 18, bookings: 39 },
  { year: 2026, isoWeek: 19, bookings: 40 }, { year: 2026, isoWeek: 20, bookings: 42 },
  { year: 2026, isoWeek: 21, bookings: 43 }, { year: 2026, isoWeek: 22, bookings: 45 },
  { year: 2026, isoWeek: 23, bookings: 46 }, { year: 2026, isoWeek: 24, bookings: 47 },
  { year: 2026, isoWeek: 25, bookings: 48 }, { year: 2026, isoWeek: 26, bookings: 47 },
  { year: 2026, isoWeek: 27, bookings: 34 }, { year: 2026, isoWeek: 28, bookings: 31 },
  { year: 2026, isoWeek: 29, bookings: 33 }, { year: 2026, isoWeek: 30, bookings: 38 },
  { year: 2026, isoWeek: 31, bookings: 44 }, { year: 2026, isoWeek: 32, bookings: 48 },
  { year: 2026, isoWeek: 33, bookings: 50 }, { year: 2026, isoWeek: 34, bookings: 52 },
  { year: 2026, isoWeek: 35, bookings: 53 }, { year: 2026, isoWeek: 36, bookings: 54 },
  { year: 2026, isoWeek: 37, bookings: 55 },
];
