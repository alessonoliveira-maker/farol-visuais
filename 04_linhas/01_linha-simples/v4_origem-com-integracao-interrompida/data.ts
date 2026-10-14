/**
 * Leads diários vindos do formulário do site, em unidades, por 42 dias a partir de 2026-05-01.
 * Dado fictício e fixo, gerado por fórmula determinística. A integração ficou fora do ar por
 * 9 dias (`leads: null`), com um lançamento manual isolado registrado no meio da queda, e o
 * último dia está parcial, coletado até o meio da tarde. Nenhuma empresa ou pessoa real.
 */
export interface DailyOrigin {
  readonly date: string;
  readonly leads: number | null;
}

const TOTAL_DAYS = 42;
const GAP_START_INDEX = 15;
const GAP_END_INDEX = 23;
const ISOLATED_INDEX = 19;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** Maio de 2026 é o mês 4 (0-indexado), início da série. */
const START_MONTH_INDEX = 4;
const START_YEAR = 2026;

/** Data corrida a partir de 2026-05-01, sem depender de `Date`. */
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

function buildDays(): readonly DailyOrigin[] {
  return Array.from({ length: TOTAL_DAYS }, (_, index) => {
    const date = isoDate(index);
    const inGap = index >= GAP_START_INDEX && index <= GAP_END_INDEX;
    if (inGap && index !== ISOLATED_INDEX) return { date, leads: null };
    const base = 12 + Math.sin(index * 0.45) * 4 + Math.cos(index * 0.17) * 2;
    return { date, leads: index === ISOLATED_INDEX ? 5 : Math.max(0, Math.round(base)) };
  });
}

export const data: readonly DailyOrigin[] = buildDays();

/** Início e fim do período sem coleta, para a faixa de aviso. */
export const gapStart: string = isoDate(GAP_START_INDEX);
export const gapEnd: string = isoDate(GAP_END_INDEX);
