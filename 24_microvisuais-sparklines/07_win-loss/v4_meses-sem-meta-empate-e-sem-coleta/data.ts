/**
 * Meta mensal de um executivo comercial contratado no meio do ano, em 12 meses seguidos, de 2025-10
 * a 2026-09. A ausência vem separada em dois campos antes de chegar ao componente: `hasTarget: false`
 * é mês sem meta atribuída (antes da contratação, de 2025-10 a 2026-04) e não é derrota; com meta e
 * `outcome: null` é mês sem coleta, que a conta também não conta. `tie` é o mês que ficou exatamente
 * no limite da meta, sem bater nem falhar. Dado fictício e fixo.
 */
export type Outcome = 'win' | 'loss' | 'tie';

export interface MonthReading {
  /** Mês em texto `YYYY-MM`. */
  readonly month: string;
  readonly hasTarget: boolean;
  /** Com meta e `null`: o mês não foi coletado. Sem meta, vale sempre `null`. */
  readonly outcome: Outcome | null;
}

const none = (month: string): MonthReading => ({ month, hasTarget: false, outcome: null });
const read = (month: string, outcome: Outcome | null): MonthReading => ({ month, hasTarget: true, outcome });

export const data: readonly MonthReading[] = [
  none('2025-10'),
  none('2025-11'),
  none('2025-12'),
  none('2026-01'),
  none('2026-02'),
  none('2026-03'),
  none('2026-04'),
  read('2026-05', 'loss'),
  read('2026-06', 'win'),
  read('2026-07', 'tie'),
  read('2026-08', null),
  read('2026-09', 'win'),
];
