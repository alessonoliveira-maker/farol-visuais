/**
 * Investimento (reais), leads e leads qualificados da plataforma A, mês a mês, de jul/25 a jun/26.
 *
 * Fev/26 está na lista com os três campos em `null`: o mês EXISTE no calendário e não foi coletado.
 * Ele não sai da lista, porque uma linha ausente da lista é indistinguível de um mês que ninguém
 * lembrou de registrar, e não vira zero, porque zero é uma medida e aqui não houve medida nenhuma.
 *
 * O CPL e a taxa de qualificação são derivados no componente a partir destes três números, porque
 * taxa sem o par que a gerou não se escreve (DAD-1).
 *
 * Dado fictício e fixo: "plataforma A" é rótulo genérico, nenhuma marca real.
 */
export interface PlatformMonth {
  readonly id: string;
  readonly month: string;
  readonly investimento: number | null;
  readonly leads: number | null;
  readonly qualificados: number | null;
}

export const data: readonly PlatformMonth[] = [
  { id: '2025-07', month: '2025-07', investimento: 41_580, leads: 210, qualificados: 44 },
  { id: '2025-08', month: '2025-08', investimento: 41_360, leads: 220, qualificados: 49 },
  { id: '2025-09', month: '2025-09', investimento: 41_296, leads: 232, qualificados: 55 },
  { id: '2025-10', month: '2025-10', investimento: 40_992, leads: 244, qualificados: 61 },
  { id: '2025-11', month: '2025-11', investimento: 40_960, leads: 256, qualificados: 68 },
  { id: '2025-12', month: '2025-12', investimento: 40_736, leads: 268, qualificados: 75 },
  { id: '2026-01', month: '2026-01', investimento: 40_880, leads: 280, qualificados: 82 },
  { id: '2026-02', month: '2026-02', investimento: null, leads: null, qualificados: null },
  { id: '2026-03', month: '2026-03', investimento: 39_600, leads: 330, qualificados: 71 },
  { id: '2026-04', month: '2026-04', investimento: 40_020, leads: 345, qualificados: 69 },
  { id: '2026-05', month: '2026-05', investimento: 40_096, leads: 358, qualificados: 65 },
  { id: '2026-06', month: '2026-06', investimento: 40_176, leads: 372, qualificados: 60 },
];
