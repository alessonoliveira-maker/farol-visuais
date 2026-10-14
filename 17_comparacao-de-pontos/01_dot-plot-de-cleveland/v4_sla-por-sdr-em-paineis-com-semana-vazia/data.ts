/**
 * Minutos até o primeiro contato de 8 SDRs em seis semanas, uma linha por SDR e semana. Dado
 * fictício e fixo: nenhum nome é pessoa real. `minutes` nulo é SDR sem lead naquela semana, e
 * nunca zero. A semana de 2026-08-31 foi o recesso e não teve lead para ninguém; Bianca M. também
 * ficou sem lead na semana de 2026-08-17. Vinícius A. mede exatamente o teto numa semana.
 */
export interface SlaRow {
  readonly id: string;
  readonly sdr: string;
  /** Segunda-feira da semana, em YYYY-MM-DD. */
  readonly week: string;
  readonly minutes: number | null;
}

/** Teto de SLA de primeiro contato, em minutos, igual nos seis painéis. */
export const SLA_CEILING = 30;

const WEEKS = ['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07'] as const;

const MINUTES_BY_SDR: readonly { readonly sdr: string; readonly minutes: readonly (number | null)[] }[] = [
  { sdr: 'Rafaela T.', minutes: [12, 9, 15, 11, null, 14] },
  { sdr: 'Maria Eduarda S.', minutes: [24, 31, 18, 22, null, 19] },
  { sdr: 'Diego P.', minutes: [8, 10, 7, 12, null, 9] },
  { sdr: 'Camila R.', minutes: [37, 42, 28, 33, null, 26] },
  { sdr: 'Thiago L.', minutes: [15, 52, 20, 18, null, 17] },
  { sdr: 'Bianca M.', minutes: [21, 19, null, 25, null, 23] },
  { sdr: 'Vinícius A.', minutes: [29, 27, 34, 30, null, 28] },
  { sdr: 'Larissa N.', minutes: [18, 74, 22, 20, null, 16] },
];

export const data: readonly SlaRow[] = MINUTES_BY_SDR.flatMap((entry, sdrIndex) =>
  WEEKS.map((week, weekIndex) => ({
    id: `sdr-${String(sdrIndex + 1)}-sem-${String(weekIndex + 1)}`,
    sdr: entry.sdr,
    week,
    minutes: entry.minutes[weekIndex] ?? null,
  })),
);
