/**
 * Oportunidades abertas do funil de vendas paradas na última avaliação, separadas em dois níveis de
 * severidade pela régua de dias sem mudança de etapa. Contagens de oportunidades e limites em dias.
 * Dado fictício e fixo.
 * O nível de atenção começa depois de `warningAboveDays` e vai até `criticalAboveDays`, inclusive;
 * o nível grave começa depois de `criticalAboveDays`. As duas contagens não se sobrepõem.
 */
export interface StalledBySeverity {
  /** Nome da exceção, impresso no cabeçalho do cartão. */
  readonly label: string;
  /** Denominador: oportunidades abertas avaliadas pela régua. */
  readonly openTotal: number;
  /** Base da régua, escrita por extenso no cartão. */
  readonly basis: string;
  readonly warningAboveDays: number;
  readonly criticalAboveDays: number;
  /** Oportunidades paradas entre os dois limites. */
  readonly warningCount: number;
  /** Oportunidades paradas acima do limite grave. */
  readonly criticalCount: number;
  /** Dia da avaliação da régua, YYYY-MM-DD. */
  readonly evaluatedOn: string;
  /** Caminho relativo da lista dos casos no Farol. */
  readonly listHref: string;
}

export const data: StalledBySeverity = {
  label: 'Oportunidades paradas',
  openTotal: 143,
  basis: 'dias desde a última mudança de etapa',
  warningAboveDays: 30,
  criticalAboveDays: 90,
  warningCount: 7,
  criticalCount: 2,
  evaluatedOn: '2026-09-14',
  listHref: '/comercial/oportunidades?regua=paradas-por-severidade',
};
