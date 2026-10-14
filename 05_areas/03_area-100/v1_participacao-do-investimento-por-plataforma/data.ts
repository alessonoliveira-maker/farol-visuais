/**
 * Investimento mensal em quatro plataformas fictícias de mídia paga ao longo de 2026, em reais.
 * O valor de cada plataforma é absoluto; a participação de cada uma no total do mês é calculada
 * no componente, porque o stackOffset="expand" normaliza só o desenho. Dado fictício e fixo.
 */
export interface MonthlyPlatformSpend {
  readonly month: string;
  readonly diretoNorte: number;
  readonly buscaSul: number;
  readonly socialLeste: number;
  readonly parceirosOeste: number;
}

export const data: readonly MonthlyPlatformSpend[] = [
  { month: '2026-01', diretoNorte: 63_000, buscaSul: 35_000, socialLeste: 21_000, parceirosOeste: 14_000 },
  { month: '2026-02', diretoNorte: 64_000, buscaSul: 36_000, socialLeste: 24_000, parceirosOeste: 15_000 },
  { month: '2026-03', diretoNorte: 65_000, buscaSul: 37_000, socialLeste: 28_000, parceirosOeste: 16_000 },
  { month: '2026-04', diretoNorte: 66_000, buscaSul: 38_000, socialLeste: 33_000, parceirosOeste: 17_000 },
  { month: '2026-05', diretoNorte: 66_000, buscaSul: 38_000, socialLeste: 39_000, parceirosOeste: 19_000 },
  { month: '2026-06', diretoNorte: 65_000, buscaSul: 37_000, socialLeste: 46_000, parceirosOeste: 21_000 },
  { month: '2026-07', diretoNorte: 64_000, buscaSul: 36_000, socialLeste: 54_000, parceirosOeste: 23_000 },
  { month: '2026-08', diretoNorte: 62_000, buscaSul: 35_000, socialLeste: 62_000, parceirosOeste: 25_000 },
  { month: '2026-09', diretoNorte: 60_000, buscaSul: 34_000, socialLeste: 70_000, parceirosOeste: 27_000 },
  { month: '2026-10', diretoNorte: 58_000, buscaSul: 33_000, socialLeste: 78_000, parceirosOeste: 29_000 },
  { month: '2026-11', diretoNorte: 56_000, buscaSul: 32_000, socialLeste: 85_000, parceirosOeste: 31_000 },
  { month: '2026-12', diretoNorte: 54_000, buscaSul: 31_000, socialLeste: 93_000, parceirosOeste: 33_000 },
];
