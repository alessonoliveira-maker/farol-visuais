/**
 * Entradas diárias de leads, em unidades, por 180 dias corridos a partir de 2026-02-01.
 * Dado fictício e fixo: a série sai de uma fórmula determinística (tendência lenta, onda semanal
 * com queda no fim de semana e ruído por seno e cosseno), nunca de sorteio, então o resultado é
 * sempre o mesmo. Nenhuma empresa ou pessoa real.
 */
export interface DailyLeads {
  readonly date: string;
  readonly leads: number;
}

const TOTAL_DAYS = 180;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** Fevereiro de 2026 é o mês 1 (0-indexado), início da série. */
const START_MONTH_INDEX = 1;
const START_YEAR = 2026;

/** Data corrida a partir de 2026-02-01, sem depender de `Date`. */
function isoDate(offsetDays: number): string {
  let year = START_YEAR;
  let month = START_MONTH_INDEX;
  let remaining = offsetDays;
  for (;;) {
    const size = DAYS_IN_MONTH[month] ?? 31;
    if (remaining < size) break;
    remaining -= size;
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }
  return `${String(year)}-${String(month + 1).padStart(2, '0')}-${String(remaining + 1).padStart(2, '0')}`;
}

function generateLeads(count: number): readonly DailyLeads[] {
  return Array.from({ length: count }, (_, index) => {
    const weekday = index % 7;
    const isWeekend = weekday === 5 || weekday === 6;
    const trend = 38 + index * 0.11;
    const weeklyWave = Math.sin((index / 7) * Math.PI * 2) * 4;
    const noise = Math.sin(index * 12.9) * 3 + Math.cos(index * 3.7) * 2;
    const base = isWeekend ? (trend + weeklyWave + noise) * 0.55 : trend + weeklyWave + noise;
    return { date: isoDate(index), leads: Math.max(0, Math.round(base)) };
  });
}

export const data: readonly DailyLeads[] = generateLeads(TOTAL_DAYS);
