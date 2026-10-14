/**
 * Três cenários de receita reconhecida mensal, em reais, partindo do mesmo mês medido
 * (2026-08) até 2026-12. Dado fictício e fixo: nenhuma empresa ou pessoa real. As três chaves
 * repetem o valor de agosto, que é o ponto de junção de onde os três tracejados saem.
 */
export interface RevenueScenario {
  readonly month: string;
  readonly conservative: number | null;
  readonly base: number | null;
  readonly optimistic: number | null;
}

export const data: readonly RevenueScenario[] = [
  { month: '2026-08', conservative: 412_500, base: 412_500, optimistic: 412_500 },
  { month: '2026-09', conservative: 418_000, base: 428_000, optimistic: 441_000 },
  { month: '2026-10', conservative: 423_000, base: 447_000, optimistic: 472_000 },
  { month: '2026-11', conservative: 429_000, base: 465_000, optimistic: 505_000 },
  { month: '2026-12', conservative: 435_000, base: 484_000, optimistic: 540_000 },
];

/** Mês medido de onde os três cenários partem. */
export const measuredMonth = '2026-08';

/** Método dos cenários, declarado por extenso porque a zona tracejada não nasce sem ele. */
export const scenarioMethod =
  'Cada cenário aplica uma taxa de crescimento mensal constante sobre a base de agosto medida: conservador 1,3% ao mês, base 4,1%, otimista 7,0%.';
