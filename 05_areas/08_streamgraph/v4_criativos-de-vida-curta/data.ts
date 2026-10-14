/**
 * Leads semanais por criativo de mídia paga em 2026 (30 semanas), em contagem de leads. Quatro
 * criativos nomeados entram e saem do ar em janelas próprias (lançamento, relançamento,
 * fechamento) ou ficam o período inteiro (evergreen); cada semana fora do ar é 0, zero medido, não
 * lacuna. Mais cinco criativos de vida curta, cada um abaixo de 3% do total do período, agregados
 * em "outras" com a contagem fixa de 5. Dado fictício e fixo.
 */
export interface CreativeWeek {
  readonly week: string;
  readonly creativoLancamento: number;
  readonly creativoEvergreen: number;
  readonly creativoRelancamento: number;
  readonly creativoFechamento: number;
  readonly outras: number;
}

/** Número de criativos de vida curta agregados em "outras": fixo, não varia por semana. */
export const outrasCount = 5;

/** Corte de participação no total do período abaixo do qual um criativo entra em "outras" (documentado, não recalculado aqui). */
export const minorShareThreshold = 0.03;

export const data: readonly CreativeWeek[] = [
  { week: '2026-01-05', creativoLancamento: 0, creativoEvergreen: 9, creativoRelancamento: 0, creativoFechamento: 0, outras: 0 },
  { week: '2026-01-12', creativoLancamento: 0, creativoEvergreen: 10, creativoRelancamento: 0, creativoFechamento: 0, outras: 1 },
  { week: '2026-01-19', creativoLancamento: 13, creativoEvergreen: 11, creativoRelancamento: 0, creativoFechamento: 0, outras: 4 },
  { week: '2026-01-26', creativoLancamento: 22, creativoEvergreen: 11, creativoRelancamento: 0, creativoFechamento: 0, outras: 6 },
  { week: '2026-02-02', creativoLancamento: 31, creativoEvergreen: 11, creativoRelancamento: 0, creativoFechamento: 0, outras: 4 },
  { week: '2026-02-09', creativoLancamento: 39, creativoEvergreen: 10, creativoRelancamento: 0, creativoFechamento: 0, outras: 1 },
  { week: '2026-02-16', creativoLancamento: 42, creativoEvergreen: 9, creativoRelancamento: 0, creativoFechamento: 0, outras: 0 },
  { week: '2026-02-23', creativoLancamento: 39, creativoEvergreen: 8, creativoRelancamento: 0, creativoFechamento: 0, outras: 0 },
  { week: '2026-03-02', creativoLancamento: 31, creativoEvergreen: 7, creativoRelancamento: 0, creativoFechamento: 0, outras: 3 },
  { week: '2026-03-09', creativoLancamento: 22, creativoEvergreen: 7, creativoRelancamento: 0, creativoFechamento: 0, outras: 5 },
  { week: '2026-03-16', creativoLancamento: 13, creativoEvergreen: 7, creativoRelancamento: 0, creativoFechamento: 0, outras: 3 },
  { week: '2026-03-23', creativoLancamento: 0, creativoEvergreen: 8, creativoRelancamento: 0, creativoFechamento: 0, outras: 1 },
  { week: '2026-03-30', creativoLancamento: 0, creativoEvergreen: 8, creativoRelancamento: 0, creativoFechamento: 0, outras: 0 },
  { week: '2026-04-06', creativoLancamento: 0, creativoEvergreen: 9, creativoRelancamento: 0, creativoFechamento: 0, outras: 0 },
  { week: '2026-04-13', creativoLancamento: 0, creativoEvergreen: 10, creativoRelancamento: 4, creativoFechamento: 0, outras: 2 },
  { week: '2026-04-20', creativoLancamento: 0, creativoEvergreen: 11, creativoRelancamento: 8, creativoFechamento: 0, outras: 5 },
  { week: '2026-04-27', creativoLancamento: 0, creativoEvergreen: 11, creativoRelancamento: 16, creativoFechamento: 0, outras: 7 },
  { week: '2026-05-04', creativoLancamento: 0, creativoEvergreen: 11, creativoRelancamento: 24, creativoFechamento: 0, outras: 5 },
  { week: '2026-05-11', creativoLancamento: 0, creativoEvergreen: 10, creativoRelancamento: 31, creativoFechamento: 0, outras: 2 },
  { week: '2026-05-18', creativoLancamento: 0, creativoEvergreen: 9, creativoRelancamento: 34, creativoFechamento: 0, outras: 0 },
  { week: '2026-05-25', creativoLancamento: 0, creativoEvergreen: 8, creativoRelancamento: 31, creativoFechamento: 0, outras: 2 },
  { week: '2026-06-01', creativoLancamento: 0, creativoEvergreen: 7, creativoRelancamento: 24, creativoFechamento: 0, outras: 4 },
  { week: '2026-06-08', creativoLancamento: 0, creativoEvergreen: 7, creativoRelancamento: 16, creativoFechamento: 4, outras: 2 },
  { week: '2026-06-15', creativoLancamento: 0, creativoEvergreen: 7, creativoRelancamento: 8, creativoFechamento: 10, outras: 1 },
  { week: '2026-06-22', creativoLancamento: 0, creativoEvergreen: 8, creativoRelancamento: 4, creativoFechamento: 18, outras: 0 },
  { week: '2026-06-29', creativoLancamento: 0, creativoEvergreen: 9, creativoRelancamento: 0, creativoFechamento: 26, outras: 4 },
  { week: '2026-07-06', creativoLancamento: 0, creativoEvergreen: 10, creativoRelancamento: 0, creativoFechamento: 30, outras: 6 },
  { week: '2026-07-13', creativoLancamento: 0, creativoEvergreen: 11, creativoRelancamento: 0, creativoFechamento: 26, outras: 4 },
  { week: '2026-07-20', creativoLancamento: 0, creativoEvergreen: 11, creativoRelancamento: 0, creativoFechamento: 18, outras: 1 },
  { week: '2026-07-27', creativoLancamento: 0, creativoEvergreen: 11, creativoRelancamento: 0, creativoFechamento: 10, outras: 0 },
];
