/**
 * Mesma faixa de cenário de 2026-T4 da v1, agora com a premissa de cada ponta escrita na tela
 * e a distância entre o cenário base e a meta. Dado fictício e fixo: nenhuma empresa ou pessoa
 * real.
 *
 * Método declarado (o que o desenho pressupõe; o check não mede isto):
 * - `goalScope` diz que a meta é do PERÍODO (o trimestre), não do ano.
 * - `asOf` é o último mês fechado que alimenta as três premissas; o trimestre em si ainda não
 *   começou nesta data, então a faixa inteira é projeção, nunca medição.
 * - As premissas curtas abaixo são a forma que cabe no rótulo da ponta; o sentido completo é o
 *   mesmo da v1: pior e melhor mês fechado dos últimos 12, e média móvel de 3 meses no base.
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
  floorPremise: 'pior mês, últimos 12',
  basePremise: 'média móvel de 3 meses fechados',
  ceilingPremise: 'melhor mês, últimos 12',
};
