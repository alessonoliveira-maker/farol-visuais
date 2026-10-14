/**
 * Cinco metas comerciais do trimestre, normalizadas em percentual da própria meta para
 * caberem na mesma escala. Valor e meta ficam na unidade original de cada métrica. Dado
 * fictício e fixo.
 */
export type MetricUnit = 'currency' | 'count' | 'rate';

export interface CommercialMetric {
  readonly id: string;
  readonly label: string;
  readonly unit: MetricUnit;
  readonly value: number;
  readonly target: number;
}

export interface CommercialGoalsPanel {
  readonly quarter: string;
  readonly acceptableFrom: number;
  readonly acceptableTo: number;
  readonly metrics: readonly CommercialMetric[];
}

export const data: CommercialGoalsPanel = {
  quarter: '2026-T3',
  acceptableFrom: 80,
  acceptableTo: 100,
  metrics: [
    { id: 'receita', label: 'Receita reconhecida', unit: 'currency', value: 3_820_000, target: 4_500_000 },
    { id: 'ganhas', label: 'Oportunidades ganhas', unit: 'count', value: 52, target: 60 },
    { id: 'conversao', label: 'Taxa de conversão de proposta', unit: 'rate', value: 0.34, target: 0.3 },
    { id: 'ticket', label: 'Ticket médio', unit: 'currency', value: 68_500, target: 72_000 },
    { id: 'contas', label: 'Novas contas assinadas', unit: 'count', value: 9, target: 15 },
  ],
};
