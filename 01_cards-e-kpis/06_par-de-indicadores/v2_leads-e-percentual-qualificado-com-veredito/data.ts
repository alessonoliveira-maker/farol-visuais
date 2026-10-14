/**
 * Leads do mês e percentual qualificado desses mesmos leads, em contagens, no mês atual e no
 * anterior. O caso é o que o par existe para pegar: o volume subiu forte, o número absoluto de
 * qualificados quase não se mexeu (652 para 673) e a taxa caiu mais de 9 pontos.
 * Dado fictício e fixo.
 */
export type GoodDirection = 'up' | 'down';

export interface MonthlyFunnel {
  /** Mês no formato YYYY-MM. */
  readonly month: string;
  /** Leads que entraram no mês: o indicador de volume. */
  readonly leads: number;
  /** Quantos desses leads foram qualificados: o numerador do contraindicador. */
  readonly qualified: number;
}

export interface PairSide {
  /** Para onde aponta o "bom" desta medida. */
  readonly goodDirection: GoodDirection;
  /** Corte de estabilidade: fração para o volume (0,05 é 5%), pontos percentuais para a taxa. */
  readonly stableBelow: number;
}

export interface LeadQualityPair {
  readonly label: string;
  readonly current: MonthlyFunnel;
  /** Mês anterior, ou `null` quando não foi medido: sem base, sem veredito. */
  readonly previous: MonthlyFunnel | null;
  readonly volume: PairSide;
  readonly quality: PairSide;
}

export const data: LeadQualityPair = {
  label: 'Leads e qualificação',
  current: { month: '2026-08', leads: 2_184, qualified: 673 },
  previous: { month: '2026-07', leads: 1_630, qualified: 652 },
  volume: { goodDirection: 'up', stableBelow: 0.05 },
  quality: { goodDirection: 'up', stableBelow: 2 },
};
