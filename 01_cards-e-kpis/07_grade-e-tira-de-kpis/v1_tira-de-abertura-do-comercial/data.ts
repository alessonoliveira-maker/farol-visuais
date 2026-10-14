/**
 * Três métricas de abertura do Comercial em ago/26, contra jul/26. Dado fictício e fixo:
 * nenhuma pessoa ou empresa real. O período é o mesmo para as três, por isso vive uma vez
 * só em `period`/`previousPeriod`, e não dentro de cada métrica.
 */
export interface OpeningMetric {
  readonly id: string;
  /** Nome da métrica, como aparece acima do número. */
  readonly label: string;
  /** Como formatar e o que somar na frase acessível ("negócios", "de ticket médio"). */
  readonly kind: 'currency' | 'count';
  readonly unitWord: string;
  readonly value: number;
  readonly previousValue: number;
  /** Para onde aponta o "bom": todas as três aqui sobem para melhor. */
  readonly goodDirection: 'up' | 'down';
}

export interface OpeningStrip {
  readonly period: string;
  readonly previousPeriod: string;
  readonly metrics: readonly OpeningMetric[];
}

export const data: OpeningStrip = {
  period: '2026-08',
  previousPeriod: '2026-07',
  metrics: [
    {
      id: 'receita-reconhecida',
      label: 'Receita reconhecida',
      kind: 'currency',
      unitWord: 'de receita',
      value: 1_284_600,
      previousValue: 1_186_200,
      goodDirection: 'up',
    },
    {
      id: 'negocios-fechados',
      label: 'Negócios fechados',
      kind: 'count',
      unitWord: 'negócios',
      value: 14,
      previousValue: 18,
      goodDirection: 'up',
    },
    {
      id: 'ticket-medio',
      label: 'Ticket médio',
      kind: 'currency',
      unitWord: 'de ticket médio',
      value: 91_757,
      previousValue: 65_900,
      goodDirection: 'up',
    },
  ],
};
