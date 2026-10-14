/**
 * Leads por mês em seis origens, de 2026-03 a 2026-08, em contagem de leads. `null` marca mês
 * anterior à entrada da origem no funil (sem histórico); número, incluso zero, é mês medido.
 * Dado fictício e fixo: origens são categorias de canal, nenhuma marca ou pessoa real.
 */
export interface MonthlyLeads {
  readonly month: string;
  readonly value: number | null;
}

export interface OriginSeries {
  readonly id: string;
  readonly name: string;
  readonly monthly: readonly MonthlyLeads[];
}

const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'] as const;

function series(values: readonly (number | null)[]): readonly MonthlyLeads[] {
  return MONTHS.map((month, index) => ({ month, value: values[index] ?? null }));
}

/** Ordem de entrada arbitrária: o componente ordena pelo total medido. */
export const data: readonly OriginSeries[] = [
  { id: 'origem-busca-paga', name: 'Busca paga', monthly: series([45, 38, 52, 41, 49, 55]) },
  { id: 'origem-indicacao', name: 'Indicação', monthly: series([18, 22, 25, 30, 34, 40]) },
  { id: 'origem-parceria', name: 'Parceria', monthly: series([50, 42, 35, 28, 20, 14]) },
  { id: 'origem-rede-social', name: 'Rede social', monthly: series([12, 60, 15, 58, 14, 61]) },
  { id: 'origem-evento', name: 'Evento presencial', monthly: series([null, null, null, null, 10, 14]) },
  { id: 'origem-base-propria', name: 'Base própria', monthly: series([0, 0, 0, 0, 0, 0]) },
];
