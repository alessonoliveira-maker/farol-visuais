/**
 * Leads captados por dia em 2025, um valor por dia do ano (365 dias). Dado fictício e fixo,
 * gerado por fórmula determinística (sem aleatório): base sazonal crescente ao longo do ano,
 * queda nos fins de semana e um ciclo curto que imita picos de campanha de mídia paga.
 */
export interface DailyLeads {
  readonly date: string;
  readonly month: number;
  readonly count: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Base do mês: cresce de ~26 leads por dia em janeiro a ~64 em dezembro. */
function seasonalBase(monthIndex: number): number {
  return 26 + Math.round(monthIndex * 3.45);
}

function weekdayFactor(date: Date): number {
  const day = date.getUTCDay();
  if (day === 0) return 0.6;
  if (day === 6) return 0.78;
  return 1;
}

function buildYear(): readonly DailyLeads[] {
  const rows: DailyLeads[] = [];
  let month = 0;
  let dayInMonth = 1;
  for (let ordinal = 0; ordinal < 365; ordinal += 1) {
    const daysThisMonth = DAYS_IN_MONTH[month] ?? 31;
    if (dayInMonth > daysThisMonth) {
      month += 1;
      dayInMonth = 1;
    }
    const iso = `2025-${pad(month + 1)}-${pad(dayInMonth)}`;
    const date = new Date(`${iso}T00:00:00Z`);
    const base = seasonalBase(month);
    const campaignWobble = Math.round(6 * Math.sin(ordinal / 9));
    const count = Math.max(4, Math.round(base * weekdayFactor(date) + campaignWobble));
    rows.push({ date: iso, month, count });
    dayInMonth += 1;
  }
  return rows;
}

export const data: readonly DailyLeads[] = buildYear();
