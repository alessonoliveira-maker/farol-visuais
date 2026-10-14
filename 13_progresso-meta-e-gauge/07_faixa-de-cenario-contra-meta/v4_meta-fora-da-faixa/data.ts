/**
 * Faixa de cenário do ano cheio de 2027 contra uma meta anual que nem o cenário otimista
 * alcança. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * Método declarado (o que o desenho pressupõe; o check não mede isto):
 * - `goalScope` diz que a meta é do ANO cheio de 2027, não de um trimestre.
 * - `asOf` é o último trimestre fechado que alimenta as três premissas; nenhum mês de 2027
 *   estava fechado nesta data, então a faixa inteira é projeção, nunca medição.
 * - As três premissas repetem, nos quatro trimestres de 2027, o ritmo trimestral pessimista,
 *   médio e otimista já fechado em 2026, sem sazonalidade.
 */
export interface AnnualScenario {
  readonly period: string;
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

export const data: AnnualScenario = {
  period: '2027',
  floor: 7_200_000,
  base: 8_600_000,
  ceiling: 9_800_000,
  goal: 12_000_000,
  goalScope: 'ano',
  asOf: '2026-06-30',
  floorPremise: 'quatro trimestres no ritmo do pior de 2026',
  basePremise: 'quatro trimestres na média móvel de 2026',
  ceilingPremise: 'quatro trimestres no ritmo do melhor de 2026',
};
