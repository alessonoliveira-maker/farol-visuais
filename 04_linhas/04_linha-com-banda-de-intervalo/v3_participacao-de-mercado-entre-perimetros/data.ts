/**
 * Participação de mercado estimada da Somma no segmento de Multi Family Office, por mês, em
 * fração de 0 a 1. `restrictedShare` é o perímetro restrito (só famílias com mandato exclusivo);
 * `broadShare` é o perímetro amplo (inclui mandato compartilhado); `estimateShare` é a estimativa
 * central publicada. Os dois perímetros são premissa declarada, não medição direta.
 * A revisão de perímetro em 2026-05 ampliou o que entra no perímetro amplo, o que muda o
 * patamar da faixa a partir dali. Dado fictício e fixo, jan a ago de 2026.
 */
export interface MarketShareMonth {
  readonly month: string;
  readonly estimateShare: number;
  readonly restrictedShare: number;
  readonly broadShare: number;
}

export const perimeterRevisionMonth = '2026-05';

export const data: readonly MarketShareMonth[] = [
  { month: '2026-01', estimateShare: 0.045, restrictedShare: 0.028, broadShare: 0.061 },
  { month: '2026-02', estimateShare: 0.047, restrictedShare: 0.030, broadShare: 0.063 },
  { month: '2026-03', estimateShare: 0.049, restrictedShare: 0.031, broadShare: 0.065 },
  { month: '2026-04', estimateShare: 0.050, restrictedShare: 0.032, broadShare: 0.067 },
  { month: '2026-05', estimateShare: 0.057, restrictedShare: 0.033, broadShare: 0.082 },
  { month: '2026-06', estimateShare: 0.059, restrictedShare: 0.034, broadShare: 0.084 },
  { month: '2026-07', estimateShare: 0.061, restrictedShare: 0.035, broadShare: 0.086 },
  { month: '2026-08', estimateShare: 0.063, restrictedShare: 0.036, broadShare: 0.088 },
];
