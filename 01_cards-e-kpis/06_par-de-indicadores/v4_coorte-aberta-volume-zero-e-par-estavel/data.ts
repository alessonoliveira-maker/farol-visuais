/**
 * Três pares em estado limite, todos lidos em coorte e em contagens: o contraindicador conta
 * quantos do próprio volume do cartão converteram. Um tem a coorte ainda aberta (o comparecimento
 * só fecha 14 dias depois da semana), um não teve volume no mês (a taxa não tem denominador) e um
 * tem as duas variações dentro do corte de estabilidade. Dado fictício e fixo.
 */
export type GoodDirection = 'up' | 'down';

/** Artigo e nome da medida, para o texto concordar: "o comparecimento", "a qualificação". */
export interface Term {
  readonly article: 'o' | 'a';
  readonly noun: string;
}

export interface CohortCount {
  /** Início do período: YYYY-MM-DD na semana, YYYY-MM no mês. */
  readonly period: string;
  /** O indicador de volume do período. */
  readonly volume: number;
  /** Quantos desse mesmo volume converteram: o numerador do contraindicador. */
  readonly converted: number;
}

export interface CohortPair {
  readonly id: string;
  readonly label: string;
  readonly grain: 'week' | 'month';
  readonly volumeTerm: Term;
  /** Texto depois do número, no plural e no singular. */
  readonly volumeCaption: string;
  readonly volumeCaptionOne: string;
  readonly rateTerm: Term;
  /** Texto depois da taxa: "de comparecimento". */
  readonly rateCaption: string;
  readonly volumeGoodDirection: GoodDirection;
  readonly rateGoodDirection: GoodDirection;
  /** Corte do volume em fração (0,05 é 5%) e da taxa em pontos percentuais. */
  readonly volumeStableBelow: number;
  readonly rateStableBelow: number;
  readonly current: CohortCount;
  /** Período anterior, com a coorte já fechada, ou `null` quando não foi medido. */
  readonly previous: CohortCount | null;
  /** Dia em que a coorte atual fecha, YYYY-MM-DD; `null` quando já fechou. */
  readonly closesOn: string | null;
}

export const data: readonly CohortPair[] = [
  {
    id: 'scheduling-open-cohort',
    label: 'Agendas e comparecimento',
    grain: 'week',
    volumeTerm: { article: 'o', noun: 'volume de agendas' },
    volumeCaption: 'agendas marcadas',
    volumeCaptionOne: 'agenda marcada',
    rateTerm: { article: 'o', noun: 'comparecimento' },
    rateCaption: 'de comparecimento',
    volumeGoodDirection: 'up',
    rateGoodDirection: 'up',
    volumeStableBelow: 0.05,
    rateStableBelow: 2,
    current: { period: '2026-08-31', volume: 126, converted: 52 },
    previous: { period: '2026-08-24', volume: 116, converted: 81 },
    closesOn: '2026-09-20',
  },
  {
    id: 'partner-leads-zero-volume',
    label: 'Leads de parceiros e qualificação',
    grain: 'month',
    volumeTerm: { article: 'o', noun: 'volume de leads' },
    volumeCaption: 'leads de parceiros',
    volumeCaptionOne: 'lead de parceiro',
    rateTerm: { article: 'a', noun: 'qualificação' },
    rateCaption: 'de leads qualificados',
    volumeGoodDirection: 'up',
    rateGoodDirection: 'up',
    volumeStableBelow: 0.05,
    rateStableBelow: 2,
    current: { period: '2026-08', volume: 0, converted: 0 },
    previous: { period: '2026-07', volume: 38, converted: 12 },
    closesOn: null,
  },
  {
    id: 'meetings-stable-pair',
    label: 'Reuniões e avanço para proposta',
    grain: 'month',
    volumeTerm: { article: 'o', noun: 'volume de reuniões' },
    volumeCaption: 'reuniões realizadas',
    volumeCaptionOne: 'reunião realizada',
    rateTerm: { article: 'o', noun: 'avanço para proposta' },
    rateCaption: 'de avanço para proposta',
    volumeGoodDirection: 'up',
    rateGoodDirection: 'up',
    volumeStableBelow: 0.05,
    rateStableBelow: 2,
    current: { period: '2026-08', volume: 57, converted: 20 },
    previous: { period: '2026-07', volume: 55, converted: 19 },
    closesOn: null,
  },
];
