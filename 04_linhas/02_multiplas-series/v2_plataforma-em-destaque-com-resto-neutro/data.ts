/**
 * Investimento mensal em mídia paga por plataforma, em reais, de 2026-01 a 2026-08.
 * Dado fictício e fixo: plataformas genéricas, nenhuma marca real.
 */
export interface MonthlyPlatformInvestment {
  readonly month: string;
  readonly buscaPaga: number;
  readonly redeSocial: number;
  readonly redeProfissional: number;
  readonly programatica: number;
}

export const data: readonly MonthlyPlatformInvestment[] = [
  { month: '2026-01', buscaPaga: 42_000, redeSocial: 38_000, redeProfissional: 21_000, programatica: 15_000 },
  { month: '2026-02', buscaPaga: 44_000, redeSocial: 37_000, redeProfissional: 27_000, programatica: 15_800 },
  { month: '2026-03', buscaPaga: 45_500, redeSocial: 36_500, redeProfissional: 34_000, programatica: 16_500 },
  { month: '2026-04', buscaPaga: 47_000, redeSocial: 35_500, redeProfissional: 41_000, programatica: 17_200 },
  { month: '2026-05', buscaPaga: 48_500, redeSocial: 35_000, redeProfissional: 48_000, programatica: 17_900 },
  { month: '2026-06', buscaPaga: 49_500, redeSocial: 34_000, redeProfissional: 55_000, programatica: 18_500 },
  { month: '2026-07', buscaPaga: 50_500, redeSocial: 33_500, redeProfissional: 61_500, programatica: 19_000 },
  { month: '2026-08', buscaPaga: 51_000, redeSocial: 33_000, redeProfissional: 68_000, programatica: 19_500 },
];

/** A série em destaque; as demais ficam neutras. Trocar reordena as séries, não só a cor. */
export const highlightId: keyof Omit<MonthlyPlatformInvestment, 'month'> = 'redeProfissional';
