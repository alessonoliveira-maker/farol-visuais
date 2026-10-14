/**
 * Quatro indicadores de Marketing em 2026-08 contra 2026-07, escolhidos para a mesma seta para
 * cima significar coisas opostas: CPL subir é ruim, taxa de agendamento subir é bom.
 * `unit` no formato de `ValueFormat` do Farol (`'currencyCompact' | 'percent'`).
 * `goodDirection: 'neutral'` é a métrica sem polaridade declarada (investimento): a variação
 * existe, mas não é boa nem ruim por si, então não leva cor semântica.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export type PolarityUnit = 'currencyCompact' | 'percent';
export type GoodDirection = 'up' | 'down' | 'neutral';

export interface PolarityRow {
  readonly id: string;
  readonly metric: string;
  readonly unit: PolarityUnit;
  readonly value: number;
  readonly previousValue: number;
  readonly previousLabel: string;
  readonly goodDirection: GoodDirection;
}

export const currentLabel = '2026-08';

export const data: readonly PolarityRow[] = [
  {
    id: 'cpl',
    metric: 'CPL',
    unit: 'currencyCompact',
    value: 84.3,
    previousValue: 75.1,
    previousLabel: '2026-07',
    goodDirection: 'down',
  },
  {
    id: 'taxa-agenda',
    metric: 'Taxa de agendamento',
    unit: 'percent',
    value: 0.184,
    previousValue: 0.164,
    previousLabel: '2026-07',
    goodDirection: 'up',
  },
  {
    id: 'investimento',
    metric: 'Investimento em mídia',
    unit: 'currencyCompact',
    value: 104_200,
    previousValue: 95_200,
    previousLabel: '2026-07',
    goodDirection: 'neutral',
  },
  {
    id: 'ticket-medio',
    metric: 'Ticket médio de contrato',
    unit: 'currencyCompact',
    value: 18_700,
    previousValue: 18_560,
    previousLabel: '2026-07',
    goodDirection: 'up',
  },
];
