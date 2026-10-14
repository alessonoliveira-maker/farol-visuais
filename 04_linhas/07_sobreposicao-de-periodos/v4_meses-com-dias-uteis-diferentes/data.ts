/**
 * Agendas comerciais acumuladas por dia útil do mês, contagem inteira.
 * "2025-12" tem 18 dias úteis (mês encurtado pelos feriados de fim de ano); "2026-05" tem 22, o
 * mês cheio. Cada mês só tem as linhas dos seus próprios dias úteis: nenhum ponto é inventado
 * para o mês curto chegar ao mesmo número de dias do mês longo. Dado fictício e fixo.
 */
export interface BusinessDayCumulativeBookings {
  readonly month: string;
  readonly businessDay: number;
  readonly cumulativeBookings: number;
}

export const data: readonly BusinessDayCumulativeBookings[] = [
  { month: '2025-12', businessDay: 1, cumulativeBookings: 5 },
  { month: '2025-12', businessDay: 2, cumulativeBookings: 11 },
  { month: '2025-12', businessDay: 3, cumulativeBookings: 19 },
  { month: '2025-12', businessDay: 4, cumulativeBookings: 26 },
  { month: '2025-12', businessDay: 5, cumulativeBookings: 35 },
  { month: '2025-12', businessDay: 6, cumulativeBookings: 43 },
  { month: '2025-12', businessDay: 7, cumulativeBookings: 53 },
  { month: '2025-12', businessDay: 8, cumulativeBookings: 62 },
  { month: '2025-12', businessDay: 9, cumulativeBookings: 69 },
  { month: '2025-12', businessDay: 10, cumulativeBookings: 75 },
  { month: '2025-12', businessDay: 11, cumulativeBookings: 83 },
  { month: '2025-12', businessDay: 12, cumulativeBookings: 92 },
  { month: '2025-12', businessDay: 13, cumulativeBookings: 102 },
  { month: '2025-12', businessDay: 14, cumulativeBookings: 110 },
  { month: '2025-12', businessDay: 15, cumulativeBookings: 117 },
  { month: '2025-12', businessDay: 16, cumulativeBookings: 126 },
  { month: '2025-12', businessDay: 17, cumulativeBookings: 134 },
  { month: '2025-12', businessDay: 18, cumulativeBookings: 140 },
  { month: '2026-05', businessDay: 1, cumulativeBookings: 6 },
  { month: '2026-05', businessDay: 2, cumulativeBookings: 13 },
  { month: '2026-05', businessDay: 3, cumulativeBookings: 21 },
  { month: '2026-05', businessDay: 4, cumulativeBookings: 28 },
  { month: '2026-05', businessDay: 5, cumulativeBookings: 37 },
  { month: '2026-05', businessDay: 6, cumulativeBookings: 45 },
  { month: '2026-05', businessDay: 7, cumulativeBookings: 55 },
  { month: '2026-05', businessDay: 8, cumulativeBookings: 64 },
  { month: '2026-05', businessDay: 9, cumulativeBookings: 72 },
  { month: '2026-05', businessDay: 10, cumulativeBookings: 79 },
  { month: '2026-05', businessDay: 11, cumulativeBookings: 88 },
  { month: '2026-05', businessDay: 12, cumulativeBookings: 96 },
  { month: '2026-05', businessDay: 13, cumulativeBookings: 106 },
  { month: '2026-05', businessDay: 14, cumulativeBookings: 115 },
  { month: '2026-05', businessDay: 15, cumulativeBookings: 123 },
  { month: '2026-05', businessDay: 16, cumulativeBookings: 130 },
  { month: '2026-05', businessDay: 17, cumulativeBookings: 139 },
  { month: '2026-05', businessDay: 18, cumulativeBookings: 147 },
  { month: '2026-05', businessDay: 19, cumulativeBookings: 157 },
  { month: '2026-05', businessDay: 20, cumulativeBookings: 166 },
  { month: '2026-05', businessDay: 21, cumulativeBookings: 174 },
  { month: '2026-05', businessDay: 22, cumulativeBookings: 181 },
];
