/**
 * Três pares de indicadores do Comercial, ago/26 contra jul/26, cada um com a própria coorte.
 * Unidades por medida: contagem, reais, horas, dias, fração média (desconto) e razão (aceite é
 * aceitos sobre repassados). Polaridades opostas convivem: desconto, tempo de handoff e idade
 * média são menor melhor. Dado fictício e fixo.
 */
export type GoodDirection = 'up' | 'down';

/** Artigo e nome da medida, para o veredito concordar: "o desconto médio", "a idade média". */
export interface Term {
  readonly article: 'o' | 'a';
  readonly noun: string;
}

export interface Ratio {
  readonly numerator: number;
  readonly denominator: number;
}

export interface MeasureBase {
  readonly term: Term;
  /** Texto depois do número: "contratos fechados", "de desconto médio". */
  readonly caption: string;
  /** Texto no singular, quando a contagem é 1. */
  readonly captionOne?: string;
  readonly goodDirection: GoodDirection;
  /** Corte de estabilidade: fração nas medidas que variam em %, pontos percentuais em share e rate. */
  readonly stableBelow: number;
}

export interface ScalarMeasure extends MeasureBase {
  /** count, currency, hours e days variam em %; share (fração média, como desconto) varia em p.p. */
  readonly kind: 'count' | 'currency' | 'hours' | 'days' | 'share';
  readonly current: number;
  readonly previous: number;
}

export interface RateMeasure extends MeasureBase {
  readonly kind: 'rate';
  readonly current: Ratio;
  readonly previous: Ratio;
}

export type Measure = ScalarMeasure | RateMeasure;

export interface IndicatorPair {
  readonly id: string;
  readonly label: string;
  /** Coorte declarada, escrita antes do mês: "fechados em ago/26". */
  readonly cohort: string;
  /** Mês atual e mês de comparação, YYYY-MM. */
  readonly month: string;
  readonly previousMonth: string;
  readonly effect: Measure;
  readonly counter: Measure;
}

export const data: readonly IndicatorPair[] = [
  {
    id: 'closing-discount',
    label: 'Fechamentos e desconto',
    cohort: 'fechados em',
    month: '2026-08',
    previousMonth: '2026-07',
    effect: {
      kind: 'count',
      term: { article: 'o', noun: 'volume de contratos' },
      caption: 'contratos fechados',
      captionOne: 'contrato fechado',
      goodDirection: 'up',
      stableBelow: 0.05,
      current: 42,
      previous: 34,
    },
    counter: {
      kind: 'share',
      term: { article: 'o', noun: 'desconto médio' },
      caption: 'de desconto médio',
      goodDirection: 'down',
      stableBelow: 1,
      current: 0.078,
      previous: 0.059,
    },
  },
  {
    id: 'handoff-acceptance',
    label: 'Handoff e aceite',
    cohort: 'repassados em',
    month: '2026-08',
    previousMonth: '2026-07',
    effect: {
      kind: 'hours',
      term: { article: 'o', noun: 'tempo de handoff' },
      caption: 'de mediana no handoff',
      goodDirection: 'down',
      stableBelow: 0.05,
      current: 6.5,
      previous: 10,
    },
    counter: {
      kind: 'rate',
      term: { article: 'o', noun: 'aceite' },
      caption: 'de aceite pelo executivo',
      goodDirection: 'up',
      stableBelow: 2,
      current: { numerator: 61, denominator: 72 },
      previous: { numerator: 57, denominator: 71 },
    },
  },
  {
    id: 'pipeline-age',
    label: 'Funil criado e idade média',
    cohort: 'criado em',
    month: '2026-08',
    previousMonth: '2026-07',
    effect: {
      kind: 'currency',
      term: { article: 'o', noun: 'funil criado' },
      caption: 'em funil criado',
      goodDirection: 'up',
      stableBelow: 0.05,
      current: 2_640_000,
      previous: 3_210_000,
    },
    counter: {
      kind: 'days',
      term: { article: 'a', noun: 'idade média' },
      caption: 'de idade média na carteira',
      goodDirection: 'down',
      stableBelow: 0.05,
      current: 37,
      previous: 44,
    },
  },
];
