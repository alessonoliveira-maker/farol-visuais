/**
 * Carteira de clientes por executivo, em reais, de 2026-T2 para 2026-T3, em quatro passos fixos:
 * novas contas, expansão, reajuste e cancelamentos, mais a variação líquida ancorada no zero.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 * Casos difíceis de propósito: Renan A. sem expansão (passo medido com valor zero), Caio M. sem
 * dado medido (`from`, `to` nulos e nenhum passo), Ana Carolina B. com o nome mais longo.
 * Fechamento por linha: variação líquida = soma dos quatro passos = `to` − `from`.
 */
export interface PortfolioItem {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly value: number;
}

export interface ExecutivePortfolio {
  readonly id: string;
  readonly name: string;
  readonly from: number | null;
  readonly to: number | null;
  readonly items: readonly PortfolioItem[];
}

export interface PortfolioPeriods {
  readonly from: string;
  readonly to: string;
}

type Steps = readonly [novas: number, expansao: number, reajuste: number, cancelamentos: number];

function items(steps: Steps): readonly PortfolioItem[] {
  const [novas, expansao, reajuste, cancelamentos] = steps;
  return [
    { id: 'novas', label: 'Novas contas', kind: 'step', value: novas },
    { id: 'expansao', label: 'Expansão', kind: 'step', value: expansao },
    { id: 'reajuste', label: 'Reajuste', kind: 'step', value: reajuste },
    { id: 'cancelamentos', label: 'Cancelamentos', kind: 'step', value: cancelamentos },
    { id: 'liquida', label: 'Variação líquida', kind: 'total', value: novas + expansao + reajuste + cancelamentos },
  ];
}

export const data: readonly ExecutivePortfolio[] = [
  { id: 'exec-01', name: 'Talita V.', from: 1_840_000, to: 2_050_000, items: items([160_000, 80_000, 30_000, -60_000]) },
  { id: 'exec-02', name: 'Murilo C.', from: 1_520_000, to: 1_660_000, items: items([140_000, 60_000, 30_000, -90_000]) },
  { id: 'exec-03', name: 'Renan A.', from: 1_310_000, to: 1_420_000, items: items([120_000, 0, 30_000, -40_000]) },
  { id: 'exec-04', name: 'Beatriz L.', from: 1_760_000, to: 1_830_000, items: items([80_000, 110_000, 30_000, -150_000]) },
  { id: 'exec-05', name: 'Caio M.', from: null, to: null, items: [] },
  { id: 'exec-06', name: 'Helena P.', from: 980_000, to: 1_120_000, items: items([100_000, 40_000, 30_000, -30_000]) },
  { id: 'exec-07', name: 'Otávio S.', from: 1_205_000, to: 1_255_000, items: items([70_000, 50_000, 30_000, -100_000]) },
  { id: 'exec-08', name: 'Larissa F.', from: 1_430_000, to: 1_490_000, items: items([50_000, 30_000, 40_000, -60_000]) },
  { id: 'exec-09', name: 'Davi R.', from: 870_000, to: 1_050_000, items: items([110_000, 50_000, 40_000, -20_000]) },
  { id: 'exec-10', name: 'Ana Carolina B.', from: 1_115_000, to: 1_165_000, items: items([60_000, 30_000, 40_000, -80_000]) },
];

export const periods: PortfolioPeriods = { from: '2026-T2', to: '2026-T3' };
