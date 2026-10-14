/**
 * Desvio diário do SLA de primeira resposta contra a meta, em pontos percentuais, para 30
 * equipes fictícias de pré-vendas em 180 dias corridos. Negativo é dia abaixo da meta (equipe
 * lenta), positivo é dia acima (equipe rápida). Trinta séries de 180 números seria impraticável
 * para digitar à mão sem virar cópia; os valores nascem de uma fórmula determinística, sem
 * `Math.random` nem relógio, fixa em qualquer execução: uma onda lenta (a tendência do
 * trimestre), uma onda rápida (o ruído do dia a dia) e um viés fixo por equipe, que é o que a
 * torna estruturalmente melhor ou pior que as demais. Nenhuma equipe é time real.
 */
export interface TeamSlaSeries {
  readonly id: string;
  readonly name: string;
  readonly deviations: readonly number[];
}

const DAYS = 180;
const REGIONS = ['SDR Norte', 'SDR Sul', 'SDR Centro'] as const;
const TEAMS_PER_REGION = 10;

function wave(day: number, seed: number): number {
  const slow = Math.sin(day * 0.035 + seed) * 4.5;
  const fast = Math.sin(day * 0.31 + seed * 2.1) * 1.6;
  const drift = Math.sin(seed) * 3;
  return Math.round((slow + fast + drift) * 10) / 10;
}

function buildTeam(regionIndex: number, teamIndex: number): TeamSlaSeries {
  const seed = regionIndex * 1.7 + teamIndex * 0.6;
  const deviations = Array.from({ length: DAYS }, (_unused, day) => wave(day, seed));
  const number = String(teamIndex + 1).padStart(2, '0');
  const region = REGIONS[regionIndex] ?? 'SDR Norte';
  const slug = region.toLowerCase().replace(/ /g, '-');
  return { id: `${slug}-${number}`, name: `${region} ${number}`, deviations };
}

export const data: readonly TeamSlaSeries[] = REGIONS.flatMap((_unused, regionIndex) =>
  Array.from({ length: TEAMS_PER_REGION }, (_unused2, teamIndex) => buildTeam(regionIndex, teamIndex)),
);

/** Passo comum a todas as equipes, em pontos percentuais de SLA. */
export const passo = 3;
