/**
 * Receita reconhecida por mês em 2026, em reais, e a meta anual fictícia de captação.
 * Os quatro últimos meses ainda não fecharam e entram como `null`: o componente calcula o
 * acumulado a partir daqui, e a coluna e a linha param no último mês com receita.
 * Dado fictício e fixo: nenhum nome cita marca, campanha ou cliente real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenue: number | null;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenue: 610_000 },
  { month: '2026-02', revenue: 705_000 },
  { month: '2026-03', revenue: 640_000 },
  { month: '2026-04', revenue: 780_000 },
  { month: '2026-05', revenue: 860_000 },
  { month: '2026-06', revenue: 905_000 },
  { month: '2026-07', revenue: 845_000 },
  { month: '2026-08', revenue: 990_000 },
  { month: '2026-09', revenue: null },
  { month: '2026-10', revenue: null },
  { month: '2026-11', revenue: null },
  { month: '2026-12', revenue: null },
];

/** Meta anual fictícia de receita reconhecida, usada como referência no eixo do acumulado. */
export const annualTarget = 10_000_000;
