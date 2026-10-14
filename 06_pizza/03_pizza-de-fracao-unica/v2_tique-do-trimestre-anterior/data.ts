/**
 * Fração das oportunidades ganhas que vieram de indicação, no trimestre corrente e no anterior.
 * Contagens absolutas, nunca fração pré-calculada: o componente divide, e é ele que decide a casa
 * decimal. Dado fictício e fixo: nenhum período, contagem ou pessoa corresponde a dado real.
 */
export interface QuarterShare {
  /** Período em prosa, não em YYYY-MM: a tela usa texto, o dado usaria o formato. */
  readonly periodLabel: string;
  /** Total de oportunidades ganhas no período. */
  readonly total: number;
  /** Quantas dessas vieram de indicação. */
  readonly referrals: number;
}

export interface ReferralQuarterTick {
  /**
   * O que a fração mede, escrito por inteiro ao lado do glifo. Curto de propósito: a coluna de
   * texto tem 152 px, e nome de marca não se corta por reticência (TIP-7).
   */
  readonly label: string;
  /** Trimestre corrente, o que a pizza desenha. */
  readonly current: QuarterShare;
  /**
   * Trimestre anterior, o que o tique marca no contorno. Pode faltar: recorte novo, produto novo
   * ou primeira medição não têm base de comparação, e aí a peça declara a falta (EST-4) em vez de
   * inventar variação.
   */
  readonly previous: QuarterShare | null;
}

export const data: ReferralQuarterTick = {
  label: 'Ganhos por indicação',
  current: { periodLabel: '3º trimestre de 2026', total: 50, referrals: 19 },
  previous: { periodLabel: '2º trimestre de 2026', total: 44, referrals: 11 },
};
