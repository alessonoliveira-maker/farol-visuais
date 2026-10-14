/**
 * Forecast da carteira de oportunidades entre duas leituras, em reais: de 2026-09-01 (leitura
 * anterior) para 2026-09-07 (leitura atual), em quatro passos.
 * Dado fictício e fixo: nenhum nome é pessoa ou empresa real.
 * Totais (`kind: 'total'`) são ancorados no zero e se dividem em `closed` (ganho já fechado) e o
 * resto, que é ponderado pela probabilidade; passos (`kind: 'step'`) são variações com sinal.
 * Fechamento: 2.310.000 + 340.000 + 185.000 − 260.000 − 410.000 = 2.165.000.
 */
export interface ForecastItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly value: number;
  /** Só nos totais: parte do valor que já é ganho fechado. */
  readonly closed?: number;
}

/** Início da semana da leitura atual. */
export const weekStart = '2026-09-07';

export const data: readonly ForecastItem[] = [
  { id: 'anterior', label: 'Forecast anterior', kind: 'total', value: 2_310_000, closed: 1_210_000 },
  { id: 'novas', label: 'Novas', kind: 'step', value: 340_000 },
  { id: 'avancos', label: 'Avanços', kind: 'step', value: 185_000 },
  { id: 'perdas', label: 'Perdas', kind: 'step', value: -260_000 },
  { id: 'deslizadas', label: 'Datas deslizadas', kind: 'step', value: -410_000 },
  { id: 'atual', label: 'Forecast atual', kind: 'total', value: 2_165_000, closed: 1_380_000 },
];
