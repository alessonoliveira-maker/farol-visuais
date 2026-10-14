/**
 * Leads por semana e por origem em 2025, contagem simples. Unidade: leads.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real, gerado por fórmula
 * determinística (base, tendência e onda sazonal por origem), nunca por sorteio.
 */
export interface OriginWeek {
  readonly origin: string;
  readonly week: string;
  readonly leads: number;
}

interface OriginProfile {
  readonly origin: string;
  readonly base: number;
  readonly trend: number;
  readonly amplitude: number;
  readonly phase: number;
}

const PROFILES: readonly OriginProfile[] = [
  { origin: 'Indicação', base: 38, trend: 0.15, amplitude: 5, phase: 0 },
  { origin: 'Busca orgânica', base: 30, trend: 0.05, amplitude: 6, phase: 8 },
  { origin: 'Mídia paga', base: 52, trend: -0.2, amplitude: 10, phase: 4 },
  { origin: 'Parceria', base: 14, trend: 0.02, amplitude: 3, phase: 20 },
  { origin: 'Evento', base: 8, trend: 0, amplitude: 6, phase: 30 },
  { origin: 'Outbound', base: 20, trend: 0.1, amplitude: 4, phase: 15 },
  { origin: 'Referência interna', base: 11, trend: 0.03, amplitude: 2, phase: 5 },
  { origin: 'Direto', base: 17, trend: -0.05, amplitude: 3, phase: 25 },
];

const WEEK_COUNT = 52;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Data ISO da segunda-feira da semana `index` (0 a 51), a partir de 2025-01-06. */
function mondayOfWeek(index: number): string {
  let dayOfYear = 6 + index * 7;
  let month = 0;
  while (dayOfYear > (MONTH_DAYS[month] ?? 31)) {
    dayOfYear -= MONTH_DAYS[month] ?? 31;
    month += 1;
  }
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(dayOfYear).padStart(2, '0');
  return `2025-${mm}-${dd}`;
}

function buildData(): readonly OriginWeek[] {
  const rows: OriginWeek[] = [];
  for (const profile of PROFILES) {
    for (let week = 0; week < WEEK_COUNT; week += 1) {
      const wave = profile.amplitude * Math.sin((2 * Math.PI * (week + profile.phase)) / 26);
      const value = Math.max(0, Math.round(profile.base + profile.trend * week + wave));
      rows.push({ origin: profile.origin, week: mondayOfWeek(week), leads: value });
    }
  }
  return rows;
}

export const data: readonly OriginWeek[] = buildData();
