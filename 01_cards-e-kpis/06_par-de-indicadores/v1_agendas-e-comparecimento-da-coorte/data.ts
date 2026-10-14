/**
 * Par de indicadores da pré-vendas lido numa coorte semanal, em contagens.
 * O efeito é o número de agendas marcadas na semana; o contraefeito é quantas DESSAS MESMAS
 * agendas tiveram comparecimento, e não as presenças que aconteceram na semana (que misturam
 * agendas marcadas antes). Por isso o denominador do comparecimento é o próprio número de agendas.
 * As duas coortes abaixo já fecharam. Dado fictício e fixo.
 */
export type GoodDirection = 'up' | 'down';

export interface CohortWeek {
  /** Primeiro dia da semana em que as agendas foram marcadas, YYYY-MM-DD. */
  readonly weekStart: string;
  /** Agendas marcadas na semana: o indicador de efeito. */
  readonly scheduled: number;
  /** Quantas dessas agendas tiveram comparecimento: o numerador do contraindicador. */
  readonly attended: number;
}

export interface PairSide {
  /** Para onde aponta o "bom" desta medida; cada lado do par tem a sua. */
  readonly goodDirection: GoodDirection;
  /**
   * Corte de estabilidade: variação abaixo disto não muda a leitura. Fração para as agendas
   * (0,05 é 5%) e pontos percentuais para o comparecimento (2 é 2,0 p.p.).
   */
  readonly stableBelow: number;
}

export interface SchedulingPair {
  /** Nome do par, que já diz a relação. */
  readonly label: string;
  readonly current: CohortWeek;
  /** Coorte da semana anterior, ou `null` quando ela não foi medida. */
  readonly previous: CohortWeek | null;
  readonly scheduling: PairSide;
  readonly attendance: PairSide;
}

export const data: SchedulingPair = {
  label: 'Agendas e comparecimento',
  current: { weekStart: '2026-08-03', scheduled: 118, attended: 84 },
  previous: { weekStart: '2026-07-27', scheduled: 102, attended: 70 },
  scheduling: { goodDirection: 'up', stableBelow: 0.05 },
  attendance: { goodDirection: 'up', stableBelow: 2 },
};
