/**
 * Oportunidades encerradas no trimestre por desfecho, em contagem. Dado fictício e fixo.
 *
 * Os casos difíceis estão nas pontas: "Transferida" tem 1 de 340 (0,3%), menos de um quadrado, e
 * "Sem motivo registrado" é ausência de dado e vai por último, fora da ordem de tamanho.
 */
export interface OutcomeSlice {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /**
   * Papel da categoria no desenho: `win` é a única que acende em `--chart-1`; `neutral` recebe um dos
   * dois tons neutros, na ordem de entrada; `missing` é a ausência de motivo, hachurada e por último.
   */
  readonly kind: 'win' | 'neutral' | 'missing';
}

export const data: readonly OutcomeSlice[] = [
  { id: 'won', label: 'Ganhas', count: 121, kind: 'win' },
  { id: 'lost', label: 'Perdidas', count: 126, kind: 'neutral' },
  { id: 'disqualified', label: 'Desqualificadas', count: 61, kind: 'neutral' },
  { id: 'transferred', label: 'Transferidas', count: 1, kind: 'neutral' },
  { id: 'no-reason', label: 'Sem motivo registrado', count: 31, kind: 'missing' },
];

/** O que o total conta e o período, escrito depois do número. */
export const totalCaption = 'oportunidades encerradas no trimestre';
