/**
 * Faixa de cenário acumulada por trimestre de 2027 (receita reconhecida desde o início do ano)
 * contra a meta anual. Dado fictício e fixo: nenhuma empresa ou pessoa real.
 *
 * Método declarado (o que o desenho pressupõe; o check não mede isto):
 * - `goalScope` diz que a meta é do ANO cheio de 2027, não de cada trimestre isolado; por isso
 *   a mesma meta se repete nas quatro linhas, como linha vertical única.
 * - `asOf` é o último trimestre fechado que alimenta as três premissas. Nenhum mês de 2027
 *   estava fechado nesta data: a faixa inteira, nas quatro linhas, é projeção.
 * - Pessimista repete o ritmo do pior trimestre fechado de 2026; base é a média móvel dos
 *   últimos 4 trimestres fechados; otimista repete o ritmo do melhor trimestre fechado de 2026.
 *   Os três acumulam trimestre a trimestre com o mesmo ritmo constante, sem sazonalidade.
 */
export interface QuarterlyCumulative {
  readonly id: string;
  readonly label: string;
  readonly floor: number;
  readonly base: number;
  readonly ceiling: number;
}

export const data: readonly QuarterlyCumulative[] = [
  { id: '2027-t1', label: '2027-T1', floor: 2_000_000, base: 2_600_000, ceiling: 3_100_000 },
  { id: '2027-t2', label: '2027-T2', floor: 4_000_000, base: 5_200_000, ceiling: 6_200_000 },
  { id: '2027-t3', label: '2027-T3', floor: 6_000_000, base: 7_800_000, ceiling: 9_300_000 },
  { id: '2027-t4', label: '2027-T4', floor: 8_000_000, base: 10_400_000, ceiling: 12_400_000 },
];

export const goal = 10_000_000;
export const goalScope = 'ano' as const;
export const asOf = '2026-06-30';
export const floorPremise = 'repete o pior trimestre fechado de 2026';
export const basePremise = 'média móvel dos últimos 4 trimestres fechados';
export const ceilingPremise = 'repete o melhor trimestre fechado de 2026';
