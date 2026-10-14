/**
 * SLA diário do primeiro contato de um squad de atendimento fictício, em fração de 0 a 1, ao
 * longo de 180 dias corridos a partir de 2026-01-01. Série gerada por uma onda determinística
 * (sem Math.random, sem relógio): o mesmo valor sai a cada execução. Fictício e fixo.
 */
export interface DailySla {
  readonly date: string;
  readonly sla: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const START_YEAR = 2026;
const TOTAL_DAYS = 180;

function dateAt(dayIndex: number): string {
  let year = START_YEAR;
  let month = 0;
  let day = dayIndex;
  while (day >= (DAYS_IN_MONTH[month] ?? 31)) {
    day -= DAYS_IN_MONTH[month] ?? 31;
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day + 1).padStart(2, '0');
  return `${String(year)}-${mm}-${dd}`;
}

function slaAt(dayIndex: number): number {
  const wave = Math.sin(dayIndex / 17) * 0.045;
  const ripple = ((dayIndex * 53) % 23) / 900;
  const value = 0.918 + wave + ripple - 0.012;
  return Math.round(Math.min(0.985, Math.max(0.74, value)) * 1000) / 1000;
}

export const data: readonly DailySla[] = Array.from({ length: TOTAL_DAYS }, (_, dayIndex) => ({
  date: dateAt(dayIndex),
  sla: slaAt(dayIndex),
}));
