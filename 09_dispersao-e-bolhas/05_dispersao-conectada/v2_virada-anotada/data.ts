/**
 * Investimento (reais), leads e leads qualificados da plataforma A, mês a mês, de jul/25 a jun/26,
 * na ordem do tempo.
 *
 * O CPL e a taxa de qualificação NÃO vêm prontos: são derivados no componente a partir destes três
 * números, porque taxa sem o par que a gerou não se escreve (DAD-1) e divisão por zero leads é
 * ausência, não zero (EST-1b).
 *
 * Dado fictício e fixo: "plataforma A" é rótulo genérico, nenhuma marca real.
 */
export interface PlatformMonth {
  readonly id: string;
  readonly month: string;
  readonly investimento: number;
  readonly leads: number;
  readonly qualificados: number;
}

export const data: readonly PlatformMonth[] = [
  { id: '2025-07', month: '2025-07', investimento: 41_000, leads: 200, qualificados: 40 },
  { id: '2025-08', month: '2025-08', investimento: 39_900, leads: 210, qualificados: 46 },
  { id: '2025-09', month: '2025-09', investimento: 39_600, leads: 225, qualificados: 56 },
  { id: '2025-10', month: '2025-10', investimento: 38_400, leads: 240, qualificados: 66 },
  { id: '2025-11', month: '2025-11', investimento: 36_540, leads: 252, qualificados: 74 },
  { id: '2025-12', month: '2025-12', investimento: 35_912, leads: 268, qualificados: 72 },
  { id: '2026-01', month: '2026-01', investimento: 36_288, leads: 288, qualificados: 70 },
  { id: '2026-02', month: '2026-02', investimento: 36_580, leads: 310, qualificados: 65 },
  { id: '2026-03', month: '2026-03', investimento: 37_520, leads: 335, qualificados: 60 },
  { id: '2026-04', month: '2026-04', investimento: 38_372, leads: 362, qualificados: 55 },
  { id: '2026-05', month: '2026-05', investimento: 39_390, leads: 390, qualificados: 51 },
  { id: '2026-06', month: '2026-06', investimento: 39_840, leads: 415, qualificados: 46 },
];
