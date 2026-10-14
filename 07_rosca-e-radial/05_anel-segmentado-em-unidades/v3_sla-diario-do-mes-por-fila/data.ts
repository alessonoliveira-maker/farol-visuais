/**
 * SLA diário de primeiro contato em três filas, nos 22 dias úteis de 2026-06, com um feriado
 * nacional (2026-06-24) sem expediente para as três. Dado fictício e fixo.
 */
export type SlaDayStatus = 'cumprido' | 'estourado' | 'feriado';

export interface SlaDay {
  readonly date: string;
  readonly status: SlaDayStatus;
}

export interface FilaSla {
  readonly id: string;
  readonly label: string;
  readonly dias: readonly SlaDay[];
}

const DATES = [
  '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
  '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12',
  '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19',
  '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26',
  '2026-06-29', '2026-06-30',
] as const;

const FERIADO_INDEX = 17;

function buildDias(estouradoIndexes: readonly number[]): readonly SlaDay[] {
  return DATES.map((date, index) => {
    if (index === FERIADO_INDEX) return { date, status: 'feriado' as const };
    return { date, status: estouradoIndexes.includes(index) ? ('estourado' as const) : ('cumprido' as const) };
  });
}

export const data: readonly FilaSla[] = [
  { id: 'inbound', label: 'Inbound', dias: buildDias([2, 8, 13, 19]) },
  { id: 'outbound', label: 'Outbound', dias: buildDias([0, 3, 5, 7, 10, 12, 15, 19, 21]) },
  { id: 'reativacao', label: 'Reativação', dias: buildDias([]) },
];
