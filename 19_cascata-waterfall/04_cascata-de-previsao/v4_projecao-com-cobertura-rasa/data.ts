/**
 * Fechamento projetado de 2026-09 sobre campo pouco preenchido, em reais: o que já foi realizado,
 * o projetado com data de fechamento e o estimado sem data.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Passos (`kind: 'step'`) começam onde o anterior terminou; o total (`kind: 'total'`) é ancorado no
 * zero e empilha os três graus de confiança na ordem dos passos.
 * Fechamento: 214.000 + 180.000 + 240.000 = 634.000.
 */
export interface ForecastItem {
  readonly id: string;
  readonly label: string;
  /** Grau de confiança: realizado (medido), datado (projeção com data) ou estimado (sem data). */
  readonly basis: 'realizado' | 'datado' | 'estimado';
  readonly kind: 'step' | 'total';
  readonly value: number;
}

/** Cobertura do campo data de fechamento: oportunidades abertas com a data preenchida e o total delas. */
export interface Coverage {
  readonly withDate: number;
  readonly open: number;
}

export const coverage: Coverage = { withDate: 44, open: 100 };

export const data: readonly ForecastItem[] = [
  { id: 'realizado', label: 'Realizado', basis: 'realizado', kind: 'step', value: 214_000 },
  { id: 'datado', label: 'Projetado', basis: 'datado', kind: 'step', value: 180_000 },
  { id: 'estimado', label: 'Estimado', basis: 'estimado', kind: 'step', value: 240_000 },
  { id: 'total', label: 'Total', basis: 'estimado', kind: 'total', value: 634_000 },
];
