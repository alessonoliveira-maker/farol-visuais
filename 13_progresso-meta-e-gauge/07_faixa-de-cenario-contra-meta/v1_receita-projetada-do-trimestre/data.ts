/**
 * Faixa de cenário da receita reconhecida de 2026-T4 contra a meta do próprio trimestre.
 * Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * Método declarado (o que o desenho pressupõe; o check não mede isto):
 * - `goalScope` diz que a meta é do PERÍODO (o trimestre), não do ano.
 * - `asOf` é o último mês fechado que alimenta as três premissas. 2026-T4 ainda não tinha
 *   começado nesta data, então a faixa inteira é projeção: nada nela é medição.
 * - Pessimista repete o pior mês fechado dos últimos 12; base é a média móvel dos últimos 3
 *   meses fechados; otimista repete o melhor mês fechado dos últimos 12. As três leem o mesmo
 *   histórico fechado até `asOf`, nunca um mês em curso.
 */
export interface QuarterlyScenario {
  readonly quarter: string;
  readonly floor: number;
  readonly base: number;
  readonly ceiling: number;
  readonly goal: number;
  readonly goalScope: 'trimestre' | 'ano';
  readonly asOf: string;
  readonly floorPremise: string;
  readonly basePremise: string;
  readonly ceilingPremise: string;
}

export const data: QuarterlyScenario = {
  quarter: '2026-T4',
  floor: 4_780_000,
  base: 5_340_000,
  ceiling: 6_050_000,
  goal: 5_500_000,
  goalScope: 'trimestre',
  asOf: '2026-09-30',
  floorPremise: 'repete o pior mês fechado dos últimos 12',
  basePremise: 'média móvel dos últimos 3 meses fechados',
  ceilingPremise: 'repete o melhor mês fechado dos últimos 12',
};
