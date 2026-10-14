/**
 * Investimento mensal em mídia paga por plataforma, últimos 12 meses, em reais.
 * "Busca paga" é a plataforma em foco no cartão; as demais mais o resto do mix ficam neutras.
 * Dado fictício e fixo.
 */
export interface MonthlyMediaMix {
  readonly month: string;
  readonly buscaPaga: number;
  readonly redesSociais: number;
  readonly programatica: number;
  readonly outros: number;
}

export const data: readonly MonthlyMediaMix[] = [
  { month: '2025-10', buscaPaga: 41_000, redesSociais: 52_000, programatica: 18_000, outros: 9_000 },
  { month: '2025-11', buscaPaga: 44_500, redesSociais: 53_800, programatica: 19_200, outros: 8_600 },
  { month: '2025-12', buscaPaga: 49_800, redesSociais: 58_100, programatica: 21_000, outros: 10_400 },
  { month: '2026-01', buscaPaga: 47_200, redesSociais: 49_600, programatica: 17_800, outros: 7_900 },
  { month: '2026-02', buscaPaga: 51_900, redesSociais: 50_300, programatica: 18_500, outros: 8_100 },
  { month: '2026-03', buscaPaga: 58_400, redesSociais: 52_700, programatica: 19_900, outros: 8_800 },
  { month: '2026-04', buscaPaga: 62_100, redesSociais: 51_200, programatica: 20_400, outros: 8_300 },
  { month: '2026-05', buscaPaga: 66_800, redesSociais: 49_900, programatica: 21_600, outros: 7_700 },
  { month: '2026-06', buscaPaga: 71_500, redesSociais: 48_100, programatica: 22_800, outros: 7_400 },
  { month: '2026-07', buscaPaga: 75_900, redesSociais: 46_500, programatica: 23_100, outros: 7_100 },
  { month: '2026-08', buscaPaga: 81_200, redesSociais: 44_800, programatica: 24_600, outros: 6_800 },
  { month: '2026-09', buscaPaga: 86_400, redesSociais: 42_900, programatica: 25_300, outros: 6_400 },
];
