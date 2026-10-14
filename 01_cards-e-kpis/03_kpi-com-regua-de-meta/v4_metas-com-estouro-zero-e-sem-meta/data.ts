/**
 * Receita nova por executivo contra a meta do mês, em reais, na fotografia de 2026-09-01: três
 * cartões escolhidos para exercitar os limites da régua. Dado fictício e fixo: nenhum nome é
 * pessoa real.
 *
 * O primeiro fechou agosto acima da meta (118%); o segundo abre setembro sem nenhum dia útil
 * fechado, com zero que ainda não é problema; o terceiro é executivo novo, sem meta declarada
 * (`goal: null`), e a régua fica neutra em vez de dividir por zero.
 */
export interface MonthlyGoal {
  readonly id: string;
  /** Nome inventado com a inicial do sobrenome. */
  readonly owner: string;
  readonly metric: string;
  /** Mês da meta, YYYY-MM. */
  readonly month: string;
  /** Realizado acumulado no mês; zero medido é zero. */
  readonly realized: number;
  /** Meta do mês, ou `null` quando ainda não foi declarada. */
  readonly goal: number | null;
  /** Dias úteis fechados no mês até a fotografia. */
  readonly businessDaysElapsed: number;
  readonly businessDaysTotal: number;
}

export const data: readonly MonthlyGoal[] = [
  {
    id: 'exec-renata',
    owner: 'Renata F.',
    metric: 'Receita nova',
    month: '2026-08',
    realized: 212_400,
    goal: 180_000,
    businessDaysElapsed: 21,
    businessDaysTotal: 21,
  },
  {
    id: 'exec-caio',
    owner: 'Caio M.',
    metric: 'Receita nova',
    month: '2026-09',
    realized: 0,
    goal: 200_000,
    businessDaysElapsed: 0,
    businessDaysTotal: 21,
  },
  {
    id: 'exec-otavio',
    owner: 'Otávio L.',
    metric: 'Receita nova',
    month: '2026-08',
    realized: 64_300,
    goal: null,
    businessDaysElapsed: 21,
    businessDaysTotal: 21,
  },
];
