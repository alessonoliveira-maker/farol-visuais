/**
 * Custo mensal em três camadas, em reais, últimos 12 meses.
 * Dado fictício e fixo: nenhum valor corresponde a despesa real de empresa real.
 */
export interface MonthlyCostLayers {
  readonly month: string;
  readonly direta: number;
  readonly rateio: number;
  readonly estrutura: number;
}

export const data: readonly MonthlyCostLayers[] = [
  { month: '2025-10', direta: 82_000, rateio: 46_000, estrutura: 31_000 },
  { month: '2025-11', direta: 88_000, rateio: 47_500, estrutura: 31_000 },
  { month: '2025-12', direta: 95_000, rateio: 49_000, estrutura: 33_500 },
  { month: '2026-01', direta: 79_000, rateio: 45_000, estrutura: 33_500 },
  { month: '2026-02', direta: 81_500, rateio: 46_500, estrutura: 34_000 },
  { month: '2026-03', direta: 96_000, rateio: 50_000, estrutura: 34_000 },
  { month: '2026-04', direta: 92_000, rateio: 48_500, estrutura: 36_000 },
  { month: '2026-05', direta: 101_000, rateio: 52_000, estrutura: 36_000 },
  { month: '2026-06', direta: 98_500, rateio: 51_000, estrutura: 38_500 },
  { month: '2026-07', direta: 90_000, rateio: 49_500, estrutura: 38_500 },
  { month: '2026-08', direta: 4_800, rateio: 50_500, estrutura: 40_000 },
  { month: '2026-09', direta: 103_000, rateio: 53_000, estrutura: 40_000 },
];
