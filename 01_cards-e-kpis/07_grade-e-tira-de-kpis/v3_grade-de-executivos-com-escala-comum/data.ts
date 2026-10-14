/**
 * Receita semanal de 12 executivos fictícios nas 13 semanas do 3º trimestre de 2026, em reais.
 * Série determinística por fórmula fixa (sem aleatório nem relógio): mesma saída sempre. O
 * domínio é comum a todos os micrográficos (EIX-9): nenhum executivo normaliza pelo próprio
 * mínimo e máximo.
 */
export interface ExecutiveWeekly {
  readonly id: string;
  readonly name: string;
  readonly weeklyRevenue: readonly number[];
}

export interface ExecutiveGrid {
  readonly periodLabel: string;
  readonly domainMax: number;
  readonly highlightId: string;
  readonly executives: readonly ExecutiveWeekly[];
}

function buildWeekly(base: number, amplitude: number, trendPerWeek: number, phase: number): number[] {
  return Array.from({ length: 13 }, (_, i) => Math.max(0, Math.round(base + trendPerWeek * i + amplitude * Math.sin((i + phase) / 2.3))));
}

export const data: ExecutiveGrid = {
  periodLabel: '3º trimestre de 2026',
  domainMax: 120_000,
  highlightId: 'exec-01',
  executives: [
    { id: 'exec-01', name: 'Renata A.', weeklyRevenue: buildWeekly(58_000, 14_000, 1_100, 0) },
    { id: 'exec-02', name: 'Murilo C.', weeklyRevenue: buildWeekly(71_000, 18_000, 900, 1) },
    { id: 'exec-03', name: 'Talita V.', weeklyRevenue: buildWeekly(45_000, 9_000, 600, 2) },
    { id: 'exec-04', name: 'Bento de Oliveira Kranz', weeklyRevenue: buildWeekly(38_000, 7_000, 300, 3) },
    { id: 'exec-05', name: 'Diego F.', weeklyRevenue: buildWeekly(96_000, 15_000, 800, 4) },
    { id: 'exec-06', name: 'Priscila N.', weeklyRevenue: buildWeekly(62_000, 11_000, 1_400, 5) },
    { id: 'exec-07', name: 'Ivo S.', weeklyRevenue: buildWeekly(29_000, 6_000, 200, 0.5) },
    { id: 'exec-08', name: 'Camila R.', weeklyRevenue: buildWeekly(83_000, 16_000, 700, 1.5) },
    { id: 'exec-09', name: 'Danilo P.', weeklyRevenue: buildWeekly(51_000, 10_000, 500, 2.5) },
    { id: 'exec-10', name: 'Vera L.', weeklyRevenue: buildWeekly(67_000, 13_000, 1_000, 3.5) },
    { id: 'exec-11', name: 'Arthur M.', weeklyRevenue: buildWeekly(34_000, 8_000, 400, 4.5) },
    { id: 'exec-12', name: 'Sabrina Q.', weeklyRevenue: buildWeekly(59_000, 12_000, 1_200, 5.5) },
  ],
};
