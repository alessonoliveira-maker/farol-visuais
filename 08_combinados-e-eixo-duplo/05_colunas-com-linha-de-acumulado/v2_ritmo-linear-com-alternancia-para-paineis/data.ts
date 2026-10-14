/**
 * Receita reconhecida por mês em 2026, em reais, e a meta anual fictícia contra a qual o ritmo
 * linear é medido. Os quatro últimos meses ainda não fecharam e entram como `null`, para que a
 * coluna não nasça zerada e a linha do acumulado pare no último mês fechado.
 *
 * O ritmo linear é a meta anual dividida por doze, calculado no componente. Os valores foram
 * escolhidos para que nenhum mês passe do dobro desse ritmo: é essa folga que deixa o domínio do
 * eixo esquerdo terminar em exatamente duas vezes o ritmo, e a marca do ritmo cair na metade da
 * altura declarada. Quatro meses fecham acima do ritmo e quatro abaixo.
 *
 * Dado fictício e fixo: nenhum nome cita marca, campanha ou cliente real.
 */
export interface MonthlyRevenue {
  readonly month: string;
  readonly revenue: number | null;
}

export const data: readonly MonthlyRevenue[] = [
  { month: '2026-01', revenue: 740_000 },
  { month: '2026-02', revenue: 1_120_000 },
  { month: '2026-03', revenue: 860_000 },
  { month: '2026-04', revenue: 1_340_000 },
  { month: '2026-05', revenue: 950_000 },
  { month: '2026-06', revenue: 1_580_000 },
  { month: '2026-07', revenue: 1_040_000 },
  { month: '2026-08', revenue: 680_000 },
  { month: '2026-09', revenue: null },
  { month: '2026-10', revenue: null },
  { month: '2026-11', revenue: null },
  { month: '2026-12', revenue: null },
];

/** Meta anual fictícia de receita reconhecida, a referência do eixo do acumulado. */
export const annualTarget = 12_000_000;
