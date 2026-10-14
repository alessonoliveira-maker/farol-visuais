/**
 * Investimento (reais), leads e leads qualificados de três plataformas de mídia, mês a mês, de
 * jul/25 a jun/26. Uma linha por plataforma e mês.
 *
 * O CPL e a taxa de qualificação são derivados no componente a partir destes três números, porque
 * taxa sem o par que a gerou não se escreve (DAD-1) e mês sem lead captado é ausência, não zero.
 *
 * Dado fictício e fixo: "plataforma A", "B" e "C" são rótulos genéricos, nenhuma marca real.
 */
export interface PlatformMonth {
  readonly id: string;
  readonly platformId: string;
  readonly name: string;
  readonly month: string;
  readonly investimento: number;
  readonly leads: number;
  readonly qualificados: number;
}

/** A trajetória acesa; no Farol vem da seleção da página. */
export const highlightId = 'plataforma-a';

export const data: readonly PlatformMonth[] = [
  { id: 'a-2025-07', platformId: 'plataforma-a', name: 'Plataforma A', month: '2025-07', investimento: 35_280, leads: 180, qualificados: 43 },
  { id: 'a-2025-08', platformId: 'plataforma-a', name: 'Plataforma A', month: '2025-08', investimento: 35_712, leads: 192, qualificados: 48 },
  { id: 'a-2025-09', platformId: 'plataforma-a', name: 'Plataforma A', month: '2025-09', investimento: 36_080, leads: 205, qualificados: 54 },
  { id: 'a-2025-10', platformId: 'plataforma-a', name: 'Plataforma A', month: '2025-10', investimento: 36_188, leads: 218, qualificados: 60 },
  { id: 'a-2025-11', platformId: 'plataforma-a', name: 'Plataforma A', month: '2025-11', investimento: 36_192, leads: 232, qualificados: 67 },
  { id: 'a-2025-12', platformId: 'plataforma-a', name: 'Plataforma A', month: '2025-12', investimento: 36_408, leads: 246, qualificados: 74 },
  { id: 'a-2026-01', platformId: 'plataforma-a', name: 'Plataforma A', month: '2026-01', investimento: 36_120, leads: 258, qualificados: 80 },
  { id: 'a-2026-02', platformId: 'plataforma-a', name: 'Plataforma A', month: '2026-02', investimento: 35_912, leads: 268, qualificados: 86 },
  { id: 'a-2026-03', platformId: 'plataforma-a', name: 'Plataforma A', month: '2026-03', investimento: 35_328, leads: 276, qualificados: 91 },
  { id: 'a-2026-04', platformId: 'plataforma-a', name: 'Plataforma A', month: '2026-04', investimento: 35_712, leads: 288, qualificados: 91 },
  { id: 'a-2026-05', platformId: 'plataforma-a', name: 'Plataforma A', month: '2026-05', investimento: 36_000, leads: 300, qualificados: 90 },
  { id: 'a-2026-06', platformId: 'plataforma-a', name: 'Plataforma A', month: '2026-06', investimento: 36_816, leads: 312, qualificados: 88 },

  { id: 'b-2025-07', platformId: 'plataforma-b', name: 'Plataforma B', month: '2025-07', investimento: 26_880, leads: 240, qualificados: 50 },
  { id: 'b-2025-08', platformId: 'plataforma-b', name: 'Plataforma B', month: '2025-08', investimento: 27_730, leads: 235, qualificados: 48 },
  { id: 'b-2025-09', platformId: 'plataforma-b', name: 'Plataforma B', month: '2025-09', investimento: 28_272, leads: 228, qualificados: 45 },
  { id: 'b-2025-10', platformId: 'plataforma-b', name: 'Plataforma B', month: '2025-10', investimento: 28_600, leads: 220, qualificados: 42 },
  { id: 'b-2025-11', platformId: 'plataforma-b', name: 'Plataforma B', month: '2025-11', investimento: 29_044, leads: 212, qualificados: 39 },
  { id: 'b-2025-12', platformId: 'plataforma-b', name: 'Plataforma B', month: '2025-12', investimento: 29_315, leads: 205, qualificados: 37 },
  { id: 'b-2026-01', platformId: 'plataforma-b', name: 'Plataforma B', month: '2026-01', investimento: 29_304, leads: 198, qualificados: 34 },
  { id: 'b-2026-02', platformId: 'plataforma-b', name: 'Plataforma B', month: '2026-02', investimento: 29_070, leads: 190, qualificados: 32 },
  { id: 'b-2026-03', platformId: 'plataforma-b', name: 'Plataforma B', month: '2026-03', investimento: 28_574, leads: 182, qualificados: 30 },
  { id: 'b-2026-04', platformId: 'plataforma-b', name: 'Plataforma B', month: '2026-04', investimento: 28_175, leads: 175, qualificados: 28 },
  { id: 'b-2026-05', platformId: 'plataforma-b', name: 'Plataforma B', month: '2026-05', investimento: 27_552, leads: 168, qualificados: 26 },
  { id: 'b-2026-06', platformId: 'plataforma-b', name: 'Plataforma B', month: '2026-06', investimento: 26_880, leads: 160, qualificados: 24 },

  { id: 'c-2025-07', platformId: 'plataforma-c', name: 'Plataforma C', month: '2025-07', investimento: 58_800, leads: 420, qualificados: 34 },
  { id: 'c-2025-08', platformId: 'plataforma-c', name: 'Plataforma C', month: '2025-08', investimento: 60_350, leads: 425, qualificados: 36 },
  { id: 'c-2025-09', platformId: 'plataforma-c', name: 'Plataforma C', month: '2025-09', investimento: 61_490, leads: 430, qualificados: 39 },
  { id: 'c-2025-10', platformId: 'plataforma-c', name: 'Plataforma C', month: '2025-10', investimento: 63_220, leads: 436, qualificados: 42 },
  { id: 'c-2025-11', platformId: 'plataforma-c', name: 'Plataforma C', month: '2025-11', investimento: 64_240, leads: 440, qualificados: 45 },
  { id: 'c-2025-12', platformId: 'plataforma-c', name: 'Plataforma C', month: '2025-12', investimento: 65_415, leads: 445, qualificados: 48 },
  { id: 'c-2026-01', platformId: 'plataforma-c', name: 'Plataforma C', month: '2026-01', investimento: 66_600, leads: 450, qualificados: 51 },
  { id: 'c-2026-02', platformId: 'plataforma-c', name: 'Plataforma C', month: '2026-02', investimento: 67_192, leads: 454, qualificados: 54 },
  { id: 'c-2026-03', platformId: 'plataforma-c', name: 'Plataforma C', month: '2026-03', investimento: 68_242, leads: 458, qualificados: 57 },
  { id: 'c-2026-04', platformId: 'plataforma-c', name: 'Plataforma C', month: '2026-04', investimento: 68_838, leads: 462, qualificados: 59 },
  { id: 'c-2026-05', platformId: 'plataforma-c', name: 'Plataforma C', month: '2026-05', investimento: 69_900, leads: 466, qualificados: 61 },
  { id: 'c-2026-06', platformId: 'plataforma-c', name: 'Plataforma C', month: '2026-06', investimento: 70_500, leads: 470, qualificados: 63 },
];
