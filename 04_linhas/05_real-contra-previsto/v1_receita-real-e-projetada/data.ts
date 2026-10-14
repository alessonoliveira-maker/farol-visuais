/**
 * Receita reconhecida mensal, em reais, de 2026-01 a 2026-12. Dado fictício e fixo: nenhuma
 * empresa ou pessoa real. `real` traz o medido até agosto; `projected` traz a projeção de
 * setembro a dezembro. Agosto aparece nas duas chaves com o mesmo valor: é o ponto de junção que
 * evita o buraco entre o trecho sólido e o tracejado.
 */
export interface MonthlyRevenueForecast {
  readonly month: string;
  readonly real: number | null;
  readonly projected: number | null;
}

export const data: readonly MonthlyRevenueForecast[] = [
  { month: '2026-01', real: 355_400, projected: null },
  { month: '2026-02', real: 362_100, projected: null },
  { month: '2026-03', real: 349_800, projected: null },
  { month: '2026-04', real: 378_200, projected: null },
  { month: '2026-05', real: 391_600, projected: null },
  { month: '2026-06', real: 405_300, projected: null },
  { month: '2026-07', real: 398_700, projected: null },
  { month: '2026-08', real: 412_500, projected: 412_500 },
  { month: '2026-09', real: null, projected: 424_000 },
  { month: '2026-10', real: null, projected: 441_000 },
  { month: '2026-11', real: null, projected: 458_000 },
  { month: '2026-12', real: null, projected: 476_000 },
];

/** Mês de corte entre o medido e o projetado. */
export const cutoffMonth = '2026-08';

/** Método da projeção, declarado por extenso porque a zona tracejada não nasce sem ele. */
export const projectionMethod =
  'Projeção pela média de crescimento mensal medida entre junho e agosto.';
