/**
 * Contratos ativos ao fim do mês, contagem inteira, mar a out de 2026. Só 5 meses de real (mar
 * a jul), bem abaixo dos cerca de 12 que o método pede para abrir um leque com base sólida; por
 * isso o horizonte projetado é truncado em 3 meses (ago a out), não os 5 de costume. Método
 * declarado: bootstrap da variação mensal dos 5 meses de real disponíveis (2.000
 * reamostragens) sobre o último valor real; a partir de ago/2026 o desenho é estimativa, e com
 * tão pouco histórico a faixa já abre muito rápido. `p05` de out/2026 é 0, não o valor bruto do
 * bootstrap: a reamostragem projetava cerca de −18 contratos, e como contrato ativo não fica
 * negativo, a borda inferior é limitada em zero (EIX-1). Dado fictício e fixo.
 */
export interface ActiveContractMonth {
  readonly month: string;
  readonly real: number | null;
  readonly p05: number | null;
  readonly p25: number | null;
  readonly median: number | null;
  readonly p75: number | null;
  readonly p95: number | null;
}

export const data: readonly ActiveContractMonth[] = [
  { month: '2026-03', real: 118, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-04', real: 122, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-05', real: 125, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-06', real: 129, p05: null, p25: null, median: null, p75: null, p95: null },
  { month: '2026-07', real: 133, p05: 133, p25: 133, median: 133, p75: 133, p95: 133 },
  { month: '2026-08', real: null, p05: 90, p25: 115, median: 138, p75: 161, p95: 195 },
  { month: '2026-09', real: null, p05: 40, p25: 108, median: 145, p75: 182, p95: 235 },
  { month: '2026-10', real: null, p05: 0, p25: 95, median: 150, p75: 205, p95: 270 },
];

/** Último mês medido: o ponto de junção onde o leque abre. */
export const todayMonth = '2026-07';

/** Número de meses de real disponíveis para o bootstrap; abaixo do piso de cerca de 12. */
export const monthsOfHistory = 5;
