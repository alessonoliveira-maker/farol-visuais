/**
 * Receita reconhecida e meta mensal de 2026, em reais.
 *
 * Dois meses têm `target` nulo porque a meta não foi cadastrada, e nulo não é zero: meta zerada
 * diria que a expectativa daquele mês era nenhuma receita. Em agosto a receita é negativa porque
 * o estorno de um contrato cancelado passou do que o mês reconheceu.
 *
 * Dado fictício e fixo: nenhuma pessoa, empresa ou operação real.
 */
export interface MonthlyRevenueWithGaps {
  /** Mês de competência, em YYYY-MM. */
  readonly month: string;
  /** Receita reconhecida no mês, em reais; negativa quando o estorno passa do reconhecido. */
  readonly revenue: number;
  /** Meta do mês, em reais, ou `null` quando ela não foi cadastrada. */
  readonly target: number | null;
}

export const data: readonly MonthlyRevenueWithGaps[] = [
  { month: '2026-01', revenue: 412_300, target: 450_000 },
  { month: '2026-02', revenue: 468_900, target: 450_000 },
  { month: '2026-03', revenue: 521_400, target: 450_000 },
  { month: '2026-04', revenue: 389_700, target: null },
  { month: '2026-05', revenue: 498_200, target: null },
  { month: '2026-06', revenue: 455_800, target: 460_000 },
  { month: '2026-07', revenue: 512_600, target: 460_000 },
  { month: '2026-08', revenue: -182_600, target: 460_000 },
  { month: '2026-09', revenue: 503_100, target: 480_000 },
  { month: '2026-10', revenue: 541_900, target: 480_000 },
  { month: '2026-11', revenue: 486_400, target: 480_000 },
  { month: '2026-12', revenue: 568_400, target: 480_000 },
];
