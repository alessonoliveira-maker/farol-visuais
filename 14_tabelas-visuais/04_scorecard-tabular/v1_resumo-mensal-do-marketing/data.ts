/**
 * Seis indicadores de Marketing em 2026-08, com meta do mês e o valor de 2026-07 para a
 * variação. `unit` usa os mesmos códigos de `ValueFormat` do despachante do Farol
 * (`'int' | 'currencyCompact' | 'percent'`), para o Chart formatar sem reimplementar.
 * `goodDirection` declara o critério de bom e ruim por linha: não é o sinal do número, é a
 * direção que a métrica precisa seguir (custo cair é bom, agenda subir é bom). `null` em
 * `previousValue` é mês sem comparação; `null` em `target` é indicador sem meta formal.
 * Dado fictício e fixo: nenhuma pessoa, empresa ou plataforma real.
 */
export type ScorecardUnit = 'int' | 'currencyCompact' | 'percent';
export type GoodDirection = 'up' | 'down' | 'neutral';

export interface ScorecardRow {
  readonly id: string;
  readonly metric: string;
  readonly unit: ScorecardUnit;
  readonly value: number;
  readonly target: number | null;
  readonly previousValue: number | null;
  readonly previousLabel: string;
  readonly goodDirection: GoodDirection;
}

export const currentLabel = '2026-08';

export const data: readonly ScorecardRow[] = [
  {
    id: 'leads',
    metric: 'Leads',
    unit: 'int',
    value: 1240,
    target: 1200,
    previousValue: 1085,
    previousLabel: '2026-07',
    goodDirection: 'up',
  },
  {
    id: 'mql',
    metric: 'MQL',
    unit: 'int',
    value: 268,
    target: 300,
    previousValue: 231,
    previousLabel: '2026-07',
    goodDirection: 'up',
  },
  {
    id: 'cpl',
    metric: 'CPL',
    unit: 'currencyCompact',
    value: 84.3,
    target: 90,
    previousValue: 96.1,
    previousLabel: '2026-07',
    goodDirection: 'down',
  },
  {
    id: 'cpl-qualificado',
    metric: 'CPL qualificado',
    unit: 'currencyCompact',
    value: 296,
    target: 260,
    previousValue: 268,
    previousLabel: '2026-07',
    goodDirection: 'down',
  },
  {
    id: 'agendas',
    metric: 'Agendas',
    unit: 'int',
    value: 96,
    target: 110,
    previousValue: 82,
    previousLabel: '2026-07',
    goodDirection: 'up',
  },
  {
    id: 'investimento',
    metric: 'Investimento em mídia',
    unit: 'currencyCompact',
    value: 104_200,
    target: 120_000,
    previousValue: 96_800,
    previousLabel: '2026-07',
    goodDirection: 'neutral',
  },
];
