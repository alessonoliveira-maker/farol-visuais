/**
 * Investimento mensal em mídia paga e custo por lead qualificado (CPL), em reais, ano
 * fictício de 2026. Dado fictício e fixo: nenhuma plataforma de mídia é real.
 * Em mar/26 não houve lead qualificado, e o CPL do mês fica nulo em vez de dividir por
 * zero ou virar R$ 0, o caso difícil que a lacuna de EIX-10 exige.
 */
export interface MonthlyMediaSpend {
  readonly month: string;
  readonly investimento: number;
  readonly cplQualificado: number | null;
}

export const data: readonly MonthlyMediaSpend[] = [
  { month: '2026-01', investimento: 42_000, cplQualificado: 184 },
  { month: '2026-02', investimento: 48_500, cplQualificado: 201 },
  { month: '2026-03', investimento: 51_000, cplQualificado: null },
  { month: '2026-04', investimento: 55_200, cplQualificado: 229 },
  { month: '2026-05', investimento: 58_900, cplQualificado: 244 },
  { month: '2026-06', investimento: 63_400, cplQualificado: 251 },
  { month: '2026-07', investimento: 67_800, cplQualificado: 268 },
  { month: '2026-08', investimento: 71_300, cplQualificado: 273 },
  { month: '2026-09', investimento: 76_600, cplQualificado: 285 },
  { month: '2026-10', investimento: 82_100, cplQualificado: 294 },
  { month: '2026-11', investimento: 88_400, cplQualificado: 306 },
  { month: '2026-12', investimento: 94_500, cplQualificado: 312 },
];
