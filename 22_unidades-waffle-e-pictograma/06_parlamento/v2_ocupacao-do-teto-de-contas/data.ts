/**
 * Lugares da carteira de um executivo contra o teto de 120 contas, em unidades, no corte de 2026-09-30.
 * Dado fictício e fixo: nenhuma pessoa ou empresa é real.
 * Os três grupos somam o teto: contas ativas, contas em risco de saída e lugares ainda livres.
 * O lugar livre é parte do conjunto, e não ausência de dado: ele é contado e desenhado.
 */
export type SeatStatus = 'active' | 'risk' | 'free';

export interface CeilingGroup {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /** O papel do grupo no teto: decide a forma do ponto (cheio, com contorno ou vazado). */
  readonly status: SeatStatus;
}

export const data: readonly CeilingGroup[] = [
  { id: 'ativas', label: 'Ativas', count: 91, status: 'active' },
  { id: 'em-risco', label: 'Em risco', count: 13, status: 'risk' },
  { id: 'folga', label: 'Folga', count: 16, status: 'free' },
];

/** O que o número do centro conta, impresso sob ele. */
export const occupiedCaption = 'lugares ocupados';
