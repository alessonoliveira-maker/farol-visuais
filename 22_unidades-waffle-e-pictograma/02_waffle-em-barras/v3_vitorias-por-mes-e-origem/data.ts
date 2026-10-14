/**
 * Oportunidades ganhas em cada mês de 2026 e a origem de cada uma, de janeiro a outubro.
 * Dado fictício e fixo: os números das oportunidades são inventados e nenhum é de operação real.
 *
 * O caso difícil está nas bordas: julho não teve vitória de evento, junho chega a 29 e fecha dez
 * linhas de três células, uma venda não tem origem declarada em três meses, e outubro é parcial,
 * contado até 2026-10-12.
 */
export type OriginKey = 'referral' | 'website' | 'event' | 'outbound' | 'unknown';

/** Origem da vitória. A ordem do array é a ordem de preenchimento da base ao topo e a ordem da legenda. */
export interface OriginDefinition {
  readonly key: OriginKey;
  readonly label: string;
  /** Slot categórico fixo da origem (1 a 6); null é a categoria de ausência, em neutro. */
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
}

export interface WonOpportunity {
  readonly id: string;
  readonly origin: OriginKey;
}

export interface MonthWins {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Data até a qual o mês foi contado, no formato YYYY-MM-DD; ausente quando o mês está fechado. */
  readonly partialUntil?: string;
  /** Vitórias do mês, na ordem de preenchimento da coluna. */
  readonly wins: readonly WonOpportunity[];
}

export const origins: readonly OriginDefinition[] = [
  { key: 'referral', label: 'Indicação', slot: 1 },
  { key: 'website', label: 'Site', slot: 3 },
  { key: 'event', label: 'Evento', slot: 6 },
  { key: 'outbound', label: 'Prospecção ativa', slot: 5 },
  { key: 'unknown', label: 'Sem origem declarada', slot: null },
];

/** Vitórias por origem de cada mês, na ordem de `origins`. */
const counts: readonly (readonly [string, readonly number[], string?])[] = [
  ['2026-01', [5, 4, 0, 3, 0]],
  ['2026-02', [6, 5, 2, 4, 0]],
  ['2026-03', [8, 5, 3, 5, 1]],
  ['2026-04', [6, 6, 0, 4, 0]],
  ['2026-05', [9, 7, 4, 5, 1]],
  ['2026-06', [10, 8, 5, 6, 0]],
  ['2026-07', [7, 6, 0, 5, 1]],
  ['2026-08', [9, 7, 3, 5, 0]],
  ['2026-09', [8, 9, 4, 6, 0]],
  ['2026-10', [3, 2, 0, 2, 0], '2026-10-12'],
];

function buildData(): readonly MonthWins[] {
  let serial = 1001;
  return counts.map(([month, perOrigin, partialUntil]) => {
    const wins: WonOpportunity[] = [];
    origins.forEach((origin, index) => {
      for (let n = 0; n < (perOrigin[index] ?? 0); n += 1) {
        wins.push({ id: `OPP-${String(serial)}`, origin: origin.key });
        serial += 1;
      }
    });
    return partialUntil === undefined ? { month, wins } : { month, partialUntil, wins };
  });
}

export const data: readonly MonthWins[] = buildData();
