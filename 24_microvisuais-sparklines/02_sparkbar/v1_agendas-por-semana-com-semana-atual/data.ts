/**
 * Agendas marcadas pela pré-vendas por semana, nas últimas 16 semanas (contagem de eventos).
 * A semana atual é a última e NÃO é o pico: a anterior foi maior, e a primeira é a menor.
 * Dado fictício e fixo.
 */
export interface WeeklyBookings {
  /** Segunda-feira da semana, no formato YYYY-MM-DD. */
  readonly weekStart: string;
  /** Agendas marcadas na semana. */
  readonly bookings: number;
}

export interface BookingsTrend {
  readonly label: string;
  readonly weeks: readonly WeeklyBookings[];
}

export const data: BookingsTrend = {
  label: 'Agendas marcadas por semana',
  weeks: [
    { weekStart: '2026-06-15', bookings: 9 },
    { weekStart: '2026-06-22', bookings: 17 },
    { weekStart: '2026-06-29', bookings: 16 },
    { weekStart: '2026-07-06', bookings: 19 },
    { weekStart: '2026-07-13', bookings: 22 },
    { weekStart: '2026-07-20', bookings: 18 },
    { weekStart: '2026-07-27', bookings: 21 },
    { weekStart: '2026-08-03', bookings: 25 },
    { weekStart: '2026-08-10', bookings: 23 },
    { weekStart: '2026-08-17', bookings: 27 },
    { weekStart: '2026-08-24', bookings: 26 },
    { weekStart: '2026-08-31', bookings: 31 },
    { weekStart: '2026-09-07', bookings: 29 },
    { weekStart: '2026-09-14', bookings: 34 },
    { weekStart: '2026-09-21', bookings: 38 },
    { weekStart: '2026-09-28', bookings: 33 },
  ],
};
