/**
 * Tempo até o primeiro contato comercial depois da entrada do lead, por semana, em horas.
 * Mediana da semana e a faixa entre o 1º e o 3º quartil (p25 a p75) da mesma semana.
 * Dado fictício e fixo: 26 semanas de 2026-03-02 a 2026-08-24.
 */
export interface FirstContactWeek {
  readonly week: string;
  readonly medianHours: number;
  readonly p25Hours: number;
  readonly p75Hours: number;
}

export const data: readonly FirstContactWeek[] = [
  { week: '2026-03-02', medianHours: 2.1, p25Hours: 1.3, p75Hours: 2.9 },
  { week: '2026-03-09', medianHours: 2.1, p25Hours: 1.3, p75Hours: 2.9 },
  { week: '2026-03-16', medianHours: 2.6, p25Hours: 1.8, p75Hours: 3.5 },
  { week: '2026-03-23', medianHours: 2.4, p25Hours: 1.5, p75Hours: 3.3 },
  { week: '2026-03-30', medianHours: 2.8, p25Hours: 1.9, p75Hours: 3.7 },
  { week: '2026-04-06', medianHours: 2.8, p25Hours: 1.9, p75Hours: 3.7 },
  { week: '2026-04-13', medianHours: 2.8, p25Hours: 1.8, p75Hours: 3.8 },
  { week: '2026-04-20', medianHours: 3.2, p25Hours: 2.2, p75Hours: 4.2 },
  { week: '2026-04-27', medianHours: 3.0, p25Hours: 2.0, p75Hours: 4.0 },
  { week: '2026-05-04', medianHours: 3.4, p25Hours: 2.4, p75Hours: 4.4 },
  { week: '2026-05-11', medianHours: 3.3, p25Hours: 2.2, p75Hours: 4.3 },
  { week: '2026-05-18', medianHours: 3.5, p25Hours: 2.4, p75Hours: 4.6 },
  /** Semana de dispersão apertada: caso difícil em que a faixa quase desaparece. */
  { week: '2026-05-25', medianHours: 3.8, p25Hours: 3.6, p75Hours: 3.9 },
  { week: '2026-06-01', medianHours: 4.2, p25Hours: 3.1, p75Hours: 5.3 },
  { week: '2026-06-08', medianHours: 3.9, p25Hours: 2.8, p75Hours: 5.0 },
  { week: '2026-06-15', medianHours: 4.1, p25Hours: 2.9, p75Hours: 5.3 },
  { week: '2026-06-22', medianHours: 4.5, p25Hours: 3.3, p75Hours: 5.7 },
  { week: '2026-06-29', medianHours: 4.8, p25Hours: 3.6, p75Hours: 6.0 },
  { week: '2026-07-06', medianHours: 4.8, p25Hours: 3.5, p75Hours: 6.0 },
  { week: '2026-07-13', medianHours: 4.8, p25Hours: 3.5, p75Hours: 6.1 },
  { week: '2026-07-20', medianHours: 5.3, p25Hours: 4.0, p75Hours: 6.6 },
  { week: '2026-07-27', medianHours: 4.9, p25Hours: 3.6, p75Hours: 6.2 },
  { week: '2026-08-03', medianHours: 5.5, p25Hours: 4.2, p75Hours: 6.8 },
  { week: '2026-08-10', medianHours: 5.3, p25Hours: 3.9, p75Hours: 6.7 },
  { week: '2026-08-17', medianHours: 5.3, p25Hours: 3.9, p75Hours: 6.7 },
  { week: '2026-08-24', medianHours: 5.5, p25Hours: 4.1, p75Hours: 6.9 },
];
