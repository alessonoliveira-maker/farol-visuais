/**
 * CPL (custo por lead) médio de cada uma das 52 semanas de 2025, em reais. Dado fictício e fixo,
 * gerado por fórmula determinística (sem aleatório): oscila em torno de R$ 38, sem tendência de
 * alta nem de baixa ao longo do ano.
 */
export interface WeeklyCpl {
  readonly week: number;
  readonly cpl: number;
}

function weeklyCpl(week: number): number {
  const base = 38;
  const cycle = Math.sin(week / 6) * 3.4;
  const ripple = Math.sin(week * 0.83) * 1.6;
  return Math.round((base + cycle + ripple) * 100) / 100;
}

export const data: readonly WeeklyCpl[] = Array.from({ length: 52 }, (_, index) => ({
  week: index + 1,
  cpl: weeklyCpl(index + 1),
}));
