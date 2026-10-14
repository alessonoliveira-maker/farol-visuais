/**
 * Fração das oportunidades ganhas no trimestre que vieram de indicação, por período.
 * Contagens absolutas (não fração pré-calculada): total de oportunidades ganhas e quantas delas
 * vieram de indicação. Dado fictício e fixo: nenhum período ou número corresponde a dado real.
 */
export interface ReferralFraction {
  /** O que a fração mede, em texto curto, exibido ao lado do glifo. */
  readonly label: string;
  /** Período em prosa, não em YYYY-MM-DD: a tela usa texto, não formato de dado. */
  readonly periodLabel: string;
  /** Total de oportunidades ganhas no período. */
  readonly total: number;
  /** Quantas dessas vieram de indicação. */
  readonly referrals: number;
}

export const data: ReferralFraction = {
  label: 'Indicação nas oportunidades ganhas',
  periodLabel: '3º trimestre de 2026',
  total: 50,
  referrals: 19,
};
