/**
 * Entradas na fila de handoff por dia útil, contagem inteira, nos últimos 20 dias úteis.
 * `threshold` é o teto diário combinado com a operação. Só dias úteis entram na série.
 * Dado fictício e fixo.
 */
export interface HandoffDay {
  /** Data no formato YYYY-MM-DD, sempre dia útil. */
  readonly date: string;
  readonly count: number;
}

export interface HandoffTrend {
  readonly label: string;
  readonly threshold: number;
  readonly days: readonly HandoffDay[];
}

export const data: HandoffTrend = {
  label: 'Entradas no handoff acima do teto diário',
  threshold: 14,
  days: [
    { date: '2026-08-10', count: 9 },
    { date: '2026-08-11', count: 11 },
    { date: '2026-08-12', count: 10 },
    { date: '2026-08-13', count: 13 },
    { date: '2026-08-14', count: 8 },
    { date: '2026-08-17', count: 12 },
    { date: '2026-08-18', count: 15 },
    { date: '2026-08-19', count: 10 },
    { date: '2026-08-20', count: 9 },
    { date: '2026-08-21', count: 11 },
    { date: '2026-08-24', count: 13 },
    { date: '2026-08-25', count: 10 },
    { date: '2026-08-26', count: 16 },
    { date: '2026-08-27', count: 9 },
    { date: '2026-08-28', count: 12 },
    { date: '2026-08-31', count: 10 },
    { date: '2026-09-01', count: 8 },
    { date: '2026-09-02', count: 11 },
    { date: '2026-09-03', count: 17 },
    { date: '2026-09-04', count: 9 },
  ],
};
