/**
 * Custo mensal em três camadas ao longo de 2026, em reais.
 * Direto é o custo que muda com o volume de operação; alocado é o custo de áreas de apoio
 * rateado sobre o time; estrutura é o custo fixo de sede e sistemas. Dado fictício e fixo.
 */
export interface MonthlyCostLayer {
  readonly month: string;
  readonly direto: number;
  readonly alocado: number;
  readonly estrutura: number;
}

export const data: readonly MonthlyCostLayer[] = [
  { month: '2026-01', direto: 182_000, alocado: 58_000, estrutura: 41_000 },
  { month: '2026-02', direto: 176_500, alocado: 59_400, estrutura: 41_000 },
  { month: '2026-03', direto: 198_200, alocado: 61_100, estrutura: 41_800 },
  { month: '2026-04', direto: 205_900, alocado: 63_700, estrutura: 41_800 },
  { month: '2026-05', direto: 214_300, alocado: 64_200, estrutura: 43_500 },
  { month: '2026-06', direto: 199_100, alocado: 65_900, estrutura: 43_500 },
  { month: '2026-07', direto: 221_800, alocado: 68_300, estrutura: 44_900 },
  { month: '2026-08', direto: 236_400, alocado: 70_100, estrutura: 44_900 },
  { month: '2026-09', direto: 244_700, alocado: 73_600, estrutura: 46_200 },
  { month: '2026-10', direto: 233_900, alocado: 75_800, estrutura: 46_200 },
  { month: '2026-11', direto: 251_600, alocado: 79_400, estrutura: 48_100 },
  { month: '2026-12', direto: 264_300, alocado: 84_900, estrutura: 48_100 },
];
